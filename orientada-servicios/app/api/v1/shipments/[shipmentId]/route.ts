import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    shipmentId: string;
  }>;
};

type UpdateShipmentStatusRequest = {
  status: string;
};

type ApiErrorResponse = {
  code: string;
  message: string;
  details: Record<string, string>;
};

const allowedShipmentStatuses = [
  "pending",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const uuidV4Pattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const buildMockShipment = (shipmentId: string) => ({
  id: shipmentId,
  customerId: "cus_001",
  address: "Av. Reforma 123, Ciudad de Mexico",
  carrier: "DHL",
  trackingNumber: "DHL-001-2026",
  estimatedDelivery: "2026-06-20",
  status: "pending",
  createdAt: "2026-06-16T18:00:00.000Z",
  updatedAt: "2026-06-16T18:00:00.000Z",
});

const buildShipmentNotFoundResponse = (shipmentId: string) => {
  const error: ApiErrorResponse = {
    code: "SHIPMENT_NOT_FOUND",
    message: "No se encontro el envio solicitado.",
    details: {
      shipmentId: `No existe un envio con el ID ${shipmentId}.`,
    },
  };

  return NextResponse.json(error, { status: 404 });
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { shipmentId } = await params;

  if (!uuidV4Pattern.test(shipmentId)) {
    return buildShipmentNotFoundResponse(shipmentId);
  }

  return NextResponse.json(buildMockShipment(shipmentId), { status: 200 });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { shipmentId } = await params;

  if (!uuidV4Pattern.test(shipmentId)) {
    return buildShipmentNotFoundResponse(shipmentId);
  }

  const body = (await request.json()) as UpdateShipmentStatusRequest;

  if (
    !allowedShipmentStatuses.includes(
      body.status as (typeof allowedShipmentStatuses)[number],
    )
  ) {
    const error: ApiErrorResponse = {
      code: "INVALID_SHIPMENT_STATUS",
      message: "La transicion de estado del envio es invalida.",
      details: {
        status:
          "Los estados permitidos son: pending, shipped, delivered, cancelled.",
      },
    };

    return NextResponse.json(error, { status: 422 });
  }

  return NextResponse.json(
    {
      ...buildMockShipment(shipmentId),
      status: body.status,
      updatedAt: new Date().toISOString(),
    },
    { status: 200 },
  );
}
