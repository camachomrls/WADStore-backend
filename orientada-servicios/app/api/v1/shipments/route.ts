import { NextResponse } from "next/server";

type CreateShipmentRequest = {
  customerId: string;
  address: string;
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
};

type ValidationErrorResponse = {
  code: "VALIDATION_ERROR";
  message: string;
  details: Record<string, string>;
};

type ApiErrorResponse = {
  code: string;
  message: string;
  details: Record<string, string>;
};

const mockShipments = [
  {
    id: "4f14edbd-e660-4ea3-a72b-c9fd4352e0fd",
    customerId: "cus_001",
    address: "Av. Reforma 123, Ciudad de Mexico",
    carrier: "DHL",
    trackingNumber: "DHL-001-2026",
    estimatedDelivery: "2026-06-20",
    status: "pending",
    createdAt: "2026-06-16T18:00:00.000Z",
  },
  {
    id: "e59b7206-16d7-4f0e-a2f3-f0c5d8336d93",
    customerId: "cus_002",
    address: "Calle Morelos 45, Guadalajara",
    carrier: "FedEx",
    trackingNumber: "FDX-002-2026",
    estimatedDelivery: "2026-06-22",
    status: "shipped",
    createdAt: "2026-06-16T18:15:00.000Z",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "10");

  if (limit > 100) {
    const error: ApiErrorResponse = {
      code: "INVALID_PAGINATION",
      message: "El limite de resultados no puede exceder 100.",
      details: {
        limit: "El valor maximo permitido para limit es 100.",
      },
    };

    return NextResponse.json(error, { status: 400 });
  }

  const total = mockShipments.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = mockShipments.slice(start, start + limit);

  return NextResponse.json(
    {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    },
    { status: 200 },
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateShipmentRequest;

  if (!body.trackingNumber?.trim()) {
    const error: ValidationErrorResponse = {
      code: "VALIDATION_ERROR",
      message: "El numero de seguimiento es obligatorio.",
      details: {
        trackingNumber: "Debe enviar un trackingNumber valido y no vacio.",
      },
    };

    return NextResponse.json(error, { status: 422 });
  }

  const shipment = {
    id: crypto.randomUUID(),
    customerId: body.customerId,
    address: body.address,
    carrier: body.carrier,
    trackingNumber: body.trackingNumber,
    estimatedDelivery: body.estimatedDelivery,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(shipment, { status: 201 });
}
