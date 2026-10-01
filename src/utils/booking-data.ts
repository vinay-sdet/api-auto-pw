export interface BookingPayload {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: {
    checkin: string;
    checkout: string;
  };
  additionalneeds: string;
}

export function createBookingPayload(): BookingPayload {
  const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  return {
    firstname: `Api-${uniqueId}`,
    lastname: "Automation",
    totalprice: 245,
    depositpaid: true,
    bookingdates: {
      checkin: "2030-01-05",
      checkout: "2030-01-12",
    },
    additionalneeds: "Breakfast",
  };
}