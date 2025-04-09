
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    console.log(`GET with ${id}`);
    return new Response("No dice", {
        status: 404
    });
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    const json = await request.json();
    console.log(`PUT with ${id}`, json);
    return new Response("No dice", {
        status: 404
    });
}