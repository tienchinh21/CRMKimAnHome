import React from "react";
import { Calendar } from "lucide-react";

interface Appointment {
  id: string;
  time: string;
  note: string;
  userAssignedname?: string;
}

interface UpcomingAppointmentsProps {
  appointments?: Appointment[];
}

const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = React.memo(
  ({ appointments }) => {
    if (!appointments || appointments.length === 0) {
      return (
        <span className="text-gray-400 text-sm">Chưa có lịch hẹn</span>
      );
    }

    return (
      <div className="space-y-2">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-start gap-2 p-2 bg-blue-50 rounded-md border border-blue-100"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-blue-700 font-medium">
                <Calendar className="h-3 w-3" />
                {new Date(appointment.time).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {appointment.note}
              </p>
              {appointment.userAssignedname && (
                <p className="text-xs text-gray-500 mt-1">
                  👤 {appointment.userAssignedname}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

UpcomingAppointments.displayName = "UpcomingAppointments";

export default UpcomingAppointments;

