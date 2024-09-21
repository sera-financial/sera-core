import { dbConnect } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const connection = await dbConnect();
    return NextResponse.json({ message: 'Database connection successful' }, { status: 200 });
  } catch (error) {
    console.error('Database connection failed:', error);
    return NextResponse.json({ message: 'Database connection failed', error: error.message }, { status: 500 });
  }
}