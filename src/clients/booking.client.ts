import type { APIRequestContext, APIResponse } from "@playwright/test";
import type { BookingPayload } from "../utils/booking-data";
import type { RequestLogEntry } from "../utils/request-logger";
import { sendLoggedRequest } from "../utils/request-logger";

export class BookingClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly log: RequestLogEntry[],
  ) {}

  createBooking(booking: BookingPayload): Promise<APIResponse> {
    return sendLoggedRequest(this.request, this.log, "POST", "/booking", { data: booking });
  }

  getBooking(id: number): Promise<APIResponse> {
    return sendLoggedRequest(this.request, this.log, "GET", `/booking/${id}`);
  }

  updateBooking(id: number, token: string | undefined, booking: BookingPayload): Promise<APIResponse> {
    return sendLoggedRequest(this.request, this.log, "PUT", `/booking/${id}`, {
      data: booking,
      headers: token ? { Cookie: `token=${token}` } : undefined,
    });
  }

  partialUpdateBooking(
    id: number,
    token: string | undefined,
    booking: Partial<BookingPayload>,
  ): Promise<APIResponse> {
    return sendLoggedRequest(this.request, this.log, "PATCH", `/booking/${id}`, {
      data: booking,
      headers: token ? { Cookie: `token=${token}` } : undefined,
    });
  }

  deleteBooking(id: number, token: string | undefined): Promise<APIResponse> {
    return sendLoggedRequest(this.request, this.log, "DELETE", `/booking/${id}`, {
      headers: token ? { Cookie: `token=${token}` } : undefined,
    });
  }
}