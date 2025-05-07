import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma"; // Corrected import path

// GET a single category by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to view this category" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const category = await prisma.category.findUnique({
      where: { id: params.id },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Verify the category belongs to the authenticated user
    if (category.userId !== user.id) {
      return NextResponse.json(
        { error: "You do not have permission to view this category" },
        { status: 403 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PUT/PATCH update a category
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to update a category" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the existing category and verify ownership
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (existingCategory.userId !== user.id) {
      return NextResponse.json(
        { error: "You do not have permission to update this category" },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Validate input (e.g., name is required for update)
    if (data.name !== undefined && !data.name) {
        return NextResponse.json({ error: "Category name cannot be empty" }, { status: 400 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        color: data.color !== undefined ? data.color : undefined,
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE a category
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to delete a category" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the existing category and verify ownership
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (existingCategory.userId !== user.id) {
      return NextResponse.json(
        { error: "You do not have permission to delete this category" },
        { status: 403 }
      );
    }

    // Note: Prisma schema handles setting categoryId to null on related tasks due to the relation definition.
    // If cascading delete of tasks was desired, the schema or logic here would need adjustment.
    await prisma.category.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    // Handle potential foreign key constraint errors if needed, though Prisma should manage this based on schema
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
