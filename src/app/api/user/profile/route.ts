import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// PUT update user profile
export async function PUT(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to update your profile" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = await request.json();

    // Basic validation
    if (!data.name || !data.email) {
        return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    // Check if email is being changed and if it's already taken
    if (data.email !== user.email) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            return NextResponse.json({ error: "Email already in use" }, { status: 409 }); // Conflict
        }
    }

    const updateData: any = {
      name: data.name,
      email: data.email,
      image: data.image !== undefined ? data.image : user.image, // Keep existing image if not provided
    };

    // Handle password change
    if (data.password) {
      if (data.password.length < 6) { // Example minimum length
        return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
      }
      const hashedPassword = await bcrypt.hash(data.password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    // Don't return the password hash
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword);

  } catch (error) {
    console.error("Error updating profile:", error);
    // Consider more specific error handling (e.g., Prisma errors)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
