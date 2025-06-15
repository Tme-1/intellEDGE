"use client";
import { useState, useEffect } from "react";

const gradeOptions = ["A", "B", "C", "D", "E", "F"];
const gradeToPoint: any = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };

type CgpaCalculatorProps = {
  token?: string;
};

export default function CgpaCalculator({ token }: CgpaCalculatorProps) {
  // GPA (single semester)
  const [gpaCourses, setGpaCourses] = useState<any[]>([]);
  const [gpaCourse, setGpaCourse] = useState({ name: "", grade: "A", creditUnit: 1 });
  const [gpa, setGpa] = useState<number>(0);

  // CGPA (multiple semesters)
  const [semesters, setSemesters] = useState<any[]>([[]]); // array of arrays of courses
  const [currentSemester, setCurrentSemester] = useState(0);
  const [cgpaCourse, setCgpaCourse] = useState({ name: "", grade: "A", creditUnit: 1 });
  const [cgpa, setCgpa] = useState<number>(0);
  const [message, setMessage] = useState<string>("");

  // Add state for semester results
  const [semesterResults, setSemesterResults] = useState<{ tqp: number; tcu: number; gpa: number }[]>([]);

  // Load last result from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cgpa_last_result");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSemesterResults(parsed.semesterResults || []);
      setCgpa(parsed.cgpa || 0);
    }
  }, []);

  // Save result to localStorage on change
  useEffect(() => {
    localStorage.setItem(
      "cgpa_last_result",
      JSON.stringify({ semesterResults, cgpa })
    );
  }, [semesterResults, cgpa]);

  // Ensure semesters[currentSemester] is always an array
  useEffect(() => {
    if (!semesters[currentSemester]) {
      setSemesters(prev => {
        const newSemesters = [...prev];
        newSemesters[currentSemester] = [];
        return newSemesters;
      });
    }
  }, [currentSemester, semesters]);

  useEffect(() => {
    if (token) fetchCgpa(token);
  }, [token]);

  // GPA logic
  function handleGpaChange(e: any) {
    setGpaCourse({ ...gpaCourse, [e.target.name]: e.target.value });
  }
  function addGpaCourse() {
    if (!gpaCourse.name || !gpaCourse.grade || !gpaCourse.creditUnit) return;
    setGpaCourses([...gpaCourses, { ...gpaCourse, creditUnit: Number(gpaCourse.creditUnit) }]);
    setGpaCourse({ name: "", grade: "A", creditUnit: 1 });
  }
  function calculateGpa() {
    let totalPoints = 0;
    let totalUnits = 0;
    for (const c of gpaCourses) {
      totalPoints += gradeToPoint[c.grade] * c.creditUnit;
      totalUnits += c.creditUnit;
    }
    const gpaValue = totalUnits === 0 ? 0 : parseFloat((totalPoints / totalUnits).toFixed(2));
    setGpa(gpaValue);
    // Save semester result if not already saved
    if (gpaCourses.length > 0) {
      setSemesterResults([{ tqp: totalPoints, tcu: totalUnits, gpa: gpaValue }]);
    }
  }

  // CGPA logic
  function handleCgpaChange(e: any) {
    setCgpaCourse({ ...cgpaCourse, [e.target.name]: e.target.value });
  }
  function addCgpaCourse() {
    if (!cgpaCourse.name || !cgpaCourse.grade || !cgpaCourse.creditUnit) return;
    const updated = [...semesters];
    updated[currentSemester] = [...updated[currentSemester], { ...cgpaCourse, creditUnit: Number(cgpaCourse.creditUnit) }];
    setSemesters(updated);
    setCgpaCourse({ name: "", grade: "A", creditUnit: 1 });
  }
  function addSemester() {
    setSemesters([...semesters, []]);
    setCurrentSemester(semesters.length);
  }
  function removeSemester(idx: number) {
    if (semesters.length === 1) return;
    const updated = semesters.filter((_, i) => i !== idx);
    setSemesters(updated);
    setCurrentSemester(Math.max(0, currentSemester - (idx <= currentSemester ? 1 : 0)));
  }
  function calculateCgpa() {
    // Add current semester's TQP/TCU to previous
    let allResults = [...semesterResults];
    // Calculate current semester's TQP/TCU
    let currentTQP = 0;
    let currentTCU = 0;
    for (const c of semesters[currentSemester]) {
      currentTQP += gradeToPoint[c.grade] * c.creditUnit;
      currentTCU += c.creditUnit;
    }
    // If this is a new semester, add its result
    if (semesters.length > semesterResults.length && currentTCU > 0) {
      allResults.push({ tqp: currentTQP, tcu: currentTCU, gpa: currentTCU === 0 ? 0 : parseFloat((currentTQP / currentTCU).toFixed(2)) });
      setSemesterResults(allResults);
    } else if (semesters.length === semesterResults.length && currentTCU > 0) {
      // If user edits the last semester, update it
      allResults[allResults.length - 1] = { tqp: currentTQP, tcu: currentTCU, gpa: currentTCU === 0 ? 0 : parseFloat((currentTQP / currentTCU).toFixed(2)) };
      setSemesterResults(allResults);
    }
    // Sum all TQP and TCU
    let totalTQP = 0;
    let totalTCU = 0;
    for (const res of allResults) {
      totalTQP += res.tqp;
      totalTCU += res.tcu;
    }
    setCgpa(totalTCU === 0 ? 0 : parseFloat((totalTQP / totalTCU).toFixed(2)));
  }

  async function saveCgpa() {
    if (!token) return setMessage("Not authenticated");
    const res = await fetch("/api/cgpa", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ courses: semesters.flat() }),
    });
    const data = await res.json();
    if (res.ok) setMessage(`Saved! CGPA: ${data.cgpa}`);
    else setMessage(data.error || "Error saving");
  }

  async function fetchCgpa(t: string) {
    const res = await fetch("/api/cgpa", {
      headers: { Authorization: `Bearer ${t}` },
    });
    const data = await res.json();
    if (res.ok) {
      setSemesters(data.courses.map((c: any) => [c]));
      setCgpa(data.cgpa);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-10">
      {/* Current GPA/CGPA display - permanent and above sections */}
      <div className="mb-8 text-lg text-center">
        {semesterResults.length === 0 && (
          <>Your current GPA is <span className="font-bold">0.00</span></>
        )}
        {semesterResults.length === 1 && (
          <>Your current GPA is <span className="font-bold">{semesterResults[0].gpa.toFixed(2)}</span></>
        )}
        {semesterResults.length > 1 && (
          <>Your current CGPA is <span className="font-bold">{cgpa.toFixed(2)}</span></>
        )}
      </div>

      {/* GPA Calculator */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">GPA Calculator (Single Semester)</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
            <input
              name="name"
              value={gpaCourse.name}
              onChange={handleGpaChange}
              placeholder="Course Name"
              className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
            <select
              name="grade"
              value={gpaCourse.grade}
              onChange={handleGpaChange}
              className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {gradeOptions.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Unit</label>
            <input
              name="creditUnit"
              type="number"
              min={1}
              value={gpaCourse.creditUnit}
              onChange={handleGpaChange}
              placeholder="Credit Unit"
              className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mb-4">
          <button 
            onClick={addGpaCourse} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Add Course
          </button>
        </div>
        
        {/* Dynamic Table */}
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit Unit</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {gpaCourses.map((c: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.grade}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.creditUnit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gradeToPoint[c.grade] * c.creditUnit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => {
                        setGpaCourses(prev => prev.filter((_, idx) => idx !== i));
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {gpaCourses.length > 0 && (
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-sm font-medium text-gray-900">Total</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {gpaCourses.reduce((sum: any, c: any) => sum + c.creditUnit, 0)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {gpaCourses.reduce((sum: any, c: any) => sum + (gradeToPoint[c.grade] * c.creditUnit), 0)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="mb-4">
          <button 
            onClick={calculateGpa} 
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors mr-2"
          >
            Calculate GPA
          </button>
          {token && (
            <button 
              onClick={saveCgpa} 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Save Results
            </button>
          )}
        </div>
        {message && (
          <div className={`p-3 rounded ${
            message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* CGPA Calculator */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">CGPA Calculator (Multiple Semesters)</h2>
        <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
          {semesters.map((_, idx) => (
            <button
              key={idx}
              className={`px-4 py-2 rounded-lg border font-bold mr-2 whitespace-nowrap ${currentSemester === idx ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={() => setCurrentSemester(idx)}
            >
              Semester {idx + 1}
              {semesters.length > 1 && (
                <span
                  className="ml-2 text-red-500 cursor-pointer"
                  onClick={e => { e.stopPropagation(); removeSemester(idx); }}
                  title="Remove semester"
                >
                  ×
                </span>
              )}
            </button>
          ))}
          <button onClick={addSemester} className="px-4 py-2 rounded-lg bg-green-500 text-white font-bold whitespace-nowrap">+ Add Semester</button>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
            <input
              name="name"
              value={cgpaCourse.name}
              onChange={handleCgpaChange}
              placeholder="Course Name"
              className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
            <select
              name="grade"
              value={cgpaCourse.grade}
              onChange={handleCgpaChange}
              className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {gradeOptions.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Unit</label>
            <input
              name="creditUnit"
              type="number"
              min={1}
              value={cgpaCourse.creditUnit}
              onChange={handleCgpaChange}
              placeholder="Credit Unit"
              className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mb-4">
          <button 
            onClick={addCgpaCourse} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Add Course
          </button>
        </div>
        
        {/* Dynamic Table */}
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit Unit</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(semesters[currentSemester] || []).map((c: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.grade}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.creditUnit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gradeToPoint[c.grade] * c.creditUnit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => {
                        const updated = [...semesters];
                        updated[currentSemester] = updated[currentSemester].filter((_: any, idx: number) => idx !== i);
                        setSemesters(updated);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {(semesters[currentSemester] || []).length > 0 && (
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-sm font-medium text-gray-900">Total</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {(semesters[currentSemester] || []).reduce((sum: any, c: any) => sum + c.creditUnit, 0)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {(semesters[currentSemester] || []).reduce((sum: any, c: any) => sum + (gradeToPoint[c.grade] * c.creditUnit), 0)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="mb-4">
          <button 
            onClick={calculateCgpa} 
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors mr-2"
          >
            Calculate CGPA
          </button>
          {token && (
            <button 
              onClick={saveCgpa} 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Save Results
            </button>
          )}
        </div>
        {message && (
          <div className={`p-3 rounded ${
            message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
} 