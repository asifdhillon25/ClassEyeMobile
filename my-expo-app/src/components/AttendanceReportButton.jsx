import { TouchableOpacity, Text, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export default function AttendanceReportButton({ student, summary, attendance }) {
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const generatePdf = async () => {
    try {
      const rows = attendance
        .map(
          (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${formatDate(item.date)}</td>
            <td>${item.class?.name || item.class?.class_name || "Class"}</td>
            <td>${item.status}</td>
            <td>${item.marked_by || "N/A"}</td>
            <td>${item.method || "N/A"}</td>
            <td>${item.is_finalized ? "Yes" : "No"}</td>
          </tr>
        `
        )
        .join("");

      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial; padding: 24px; }
              h1 { color: #0D9488; }
              .box { margin-bottom: 18px; }
              table { width: 100%; border-collapse: collapse; margin-top: 18px; }
              th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
              th { background-color: #0D9488; color: white; }
            </style>
          </head>
          <body>
            <h1>Student Attendance Report</h1>

            <div class="box">
              <p><b>Name:</b> ${student?.name || "N/A"}</p>
              <p><b>Roll No:</b> ${student?.roll_no || "N/A"}</p>
              <p><b>Email:</b> ${student?.email || "N/A"}</p>
              <p><b>Department:</b> ${student?.department || "N/A"}</p>
              <p><b>Year:</b> ${student?.year || "N/A"}</p>
            </div>

            <div class="box">
              <p><b>Total Days:</b> ${summary?.total_days || 0}</p>
              <p><b>Present Days:</b> ${summary?.present_days || 0}</p>
              <p><b>Absent Days:</b> ${summary?.absent_days || 0}</p>
              <p><b>Attendance Percentage:</b> ${summary?.attendance_percentage || 0}%</p>
            </div>

            <table>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Class</th>
                <th>Status</th>
                <th>Marked By</th>
                <th>Method</th>
                <th>Finalized</th>
              </tr>
              ${rows}
            </table>
          </body>
        </html>
      `;

      const file = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri);
      } else {
        Alert.alert("PDF Created", file.uri);
      }
    } catch (error) {
      console.log("PDF error:", error);
      Alert.alert("Error", "Failed to generate PDF report.");
    }
  };

  return (
    <TouchableOpacity
      onPress={generatePdf}
      className="bg-light-primary dark:bg-dark-primary rounded-2xl p-4 flex-row items-center justify-center mb-4"
      activeOpacity={0.8}
    >
      <Ionicons name="download-outline" size={20} color="white" />
      <Text className="text-white font-bold ml-2">Download PDF Report</Text>
    </TouchableOpacity>
  );
}