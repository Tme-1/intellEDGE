import { NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client only if we have the required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(req: Request) {
  // Skip the entire handler during build time if JWT_SECRET is missing
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    return NextResponse.json({ material: null });
  }

  try {
    if (!supabase) {
      return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
    }

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyJwt(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const title = formData.get("title") as string;
    const courseTitle = formData.get("courseTitle") as string;
    const department = formData.get("department") as string;
    const level = formData.get("level") as string;

    if (
      !file ||
      !(file instanceof Blob) ||
      !title ||
      !courseTitle ||
      !department ||
      !level
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upload file to Supabase Storage
    const fileName = `${user.id}/${Date.now()}_${title}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('materials')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('materials')
      .getPublicUrl(fileName);

    const material = await prisma.downloads.create({
      data: {
        user_id: user.id,
        material_id: uploadData.path,
        material_title: title,
        created_at: new Date().toISOString()
      },
    });

    return NextResponse.json({ material });
  } catch (error) {
    console.error("Error uploading material:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 