// Writes a simple one-page PDF CV for the live demo (no libraries): docs/demo/Ananya_Das_CV.pdf
import fs from "node:fs";
const lines = [
  ["F2", 20, "Ananya Das"],
  ["F1", 11, "B.Tech, Computer Science (3rd year) - Odisha University of Technology and Research, Bhubaneswar"],
  ["F1", 11, "Bhubaneswar, Odisha"],
  ["F2", 13, ""],
  ["F2", 13, "Skills"],
  ["F1", 11, "Python, SQL, Excel, Google Sheets, HTML, CSS, JavaScript, React (basics), Git, Data analysis"],
  ["F2", 13, ""],
  ["F2", 13, "Projects"],
  ["F1", 11, "Canteen pre-order web app - React and Google Sheets; used by 120 students in my hostel for one semester."],
  ["F1", 11, "College fest sales analysis - cleaned 3,000 rows of stall sales in Python and pandas; found the top 5 stalls."],
  ["F1", 11, "Campus newsletter - wrote and edited 6 issues of the CSE department newsletter."],
  ["F2", 13, ""],
  ["F2", 13, "Experience"],
  ["F1", 11, "Volunteer, NSS unit - taught basic computer skills to 25 women in a self-help group (2025)."],
  ["F1", 11, "Summer project, family medical shop - built a stock list in Google Sheets with low-stock alerts."],
  ["F2", 13, ""],
  ["F2", 13, "Interests"],
  ["F1", 11, "Data, small businesses, startups, and writing. Curious about journalism and product management."],
];
const BS = String.fromCharCode(92);
let y = 790;
let content = "BT\n";
for (const [f, size, text] of lines) {
  if (size !== 20) y -= size + 9;
  const esc = text.split(BS).join(BS + BS).split("(").join(BS + "(").split(")").join(BS + ")");
  content += `/${f} ${size} Tf 1 0 0 1 56 ${y} Tm (${esc}) Tj\n`;
  if (size === 20) y -= 12;
}
content += "ET\n";
const objs = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>",
  `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}endstream`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
];
let pdf = "%PDF-1.4\n";
const offs = [];
objs.forEach((o, i) => {
  offs.push(Buffer.byteLength(pdf, "latin1"));
  pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
});
const xref = Buffer.byteLength(pdf, "latin1");
pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
fs.mkdirSync("docs/demo", { recursive: true });
fs.writeFileSync("docs/demo/Ananya_Das_CV.pdf", pdf, "latin1");
console.log("wrote docs/demo/Ananya_Das_CV.pdf", pdf.length, "bytes");
