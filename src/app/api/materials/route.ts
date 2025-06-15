import { NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  // Skip authentication during build time
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    return NextResponse.json({ materials: [] });
  }

  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyJwt(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const materials = await prisma.downloads.findMany({
      where: {
        user_id: payload.sub
      },
      select: {
        id: true,
        material_id: true,
        material_title: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json({ materials })
  } catch (error) {
    console.error('Error fetching materials:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 