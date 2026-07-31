/**
 * generate-excel-report.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates an Excel (.xlsx) test-case summary for the Selenium E2E suite.
 *
 * Install: npm install exceljs
 * Run    : node selenium-tests/generate-excel-report.js
 * Output : selenium-tests/QuantAI_E2E_Test_Report.xlsx
 */

const ExcelJS = require("exceljs");
const path    = require("path");
const fs      = require("fs");

// ─── Test case definitions ───────────────────────────────────────────────────
// Columns: id, suite, name, page, category, priority, automationType, steps, expected, status
const TESTS = [];

function add(id, suite, name, page, category, priority, steps, expected) {
  TESTS.push({
    id, suite, name, page, category, priority,
    automationType: "Selenium WebDriver",
    steps, expected,
    status: "Not Run",
    notes: "",
  });
}

// ─── Suite 1: Landing Page ───────────────────────────────────────────────────
const s1Data = [
  ["TC-001","Page title is not empty","/","Page Load","High","Navigate to /","Title length > 0"],
  ["TC-002","Title contains brand keyword","/","Page Load","High","Navigate to /","Title matches /quant|ai|trading/"],
  ["TC-003","nav/header element present","/","Navigation","High","Navigate to /","nav or header tag exists"],
  ["TC-004","CTA link exists on landing","/","Navigation","Medium","Navigate to /","Login/Signup link or button present"],
  ["TC-005","Login link navigates to /login","/","Navigation","High","Click login link","URL contains /login"],
  ["TC-006","Signup link navigates to /signup","/","Navigation","High","Click signup link","URL contains /signup"],
  ["TC-007","Hero H1 present","/","UI Elements","Medium","Navigate to /","h1 or [class*=hero] exists"],
  ["TC-008","Footer present","/","UI Elements","Low","Navigate to /","footer tag exists"],
  ["TC-009","No 404 text on landing","/","Page Load","High","Navigate to /","Body text does not include 404"],
  ["TC-010","No 500 text on landing","/","Page Load","High","Navigate to /","Body text does not include 500"],
  ["TC-011","/features route accessible","/features","Navigation","Medium","Navigate to /features","URL contains /features"],
  ["TC-012","/contact route accessible","/contact","Navigation","Medium","Navigate to /contact","URL contains /contact"],
  ["TC-013","/about route accessible","/about","Navigation","Medium","Navigate to /about","URL contains /about"],
  ["TC-014","Mobile 375px renders body","/","Responsive","Medium","Resize to 375px, navigate","body exists"],
  ["TC-015","Logo/brand icon present","/","UI Elements","Medium","Navigate to /","img, svg, or .logo exists"],
  ["TC-016","Page loads within 5 s","/","Performance","High","Navigate to / and time","Load time < 5000 ms"],
  ["TC-017","Meta description tag present","/","SEO","Medium","Navigate to /","meta[name=description] exists"],
  ["TC-018","At least one H1 tag","/","SEO","Medium","Navigate to /","One or more h1 elements"],
  ["TC-019","Unauthenticated /dashboard redirects","/dashboard","Security","High","Navigate to /dashboard","Redirects to /login or /"],
  ["TC-020","External links have rel=noopener","/","Security","Medium","Navigate to /","a[target=_blank] has rel=noopener"],
  ["TC-021","HTML lang attribute set","/","Accessibility","Medium","Navigate to /","document.documentElement.lang truthy"],
  ["TC-022","Favicon link present","/","SEO","Low","Navigate to /","link[rel*=icon] exists"],
  ["TC-023","Viewport meta tag set","/","Responsive","Medium","Navigate to /","viewport meta with width=device-width"],
  ["TC-024","Page served over http(s)","/","Infrastructure","High","Navigate to /","URL starts with http"],
  ["TC-025","1920×1080 renders body","/","Responsive","Low","Resize to 1920px, navigate","body exists"],
];
s1Data.forEach(([id,name,page,cat,pri,steps,exp]) => add(id,"Suite 1: Landing Page",name,page,cat,pri,steps,exp));

// ─── Suite 2: Login Page ─────────────────────────────────────────────────────
const s2Data = [
  ["TC-026","Login page loads","/login","Page Load","High","Navigate to /login","URL contains /login"],
  ["TC-027","Email input present","/login","Form Fields","High","Navigate to /login","input[type=email] exists"],
  ["TC-028","Password input present","/login","Form Fields","High","Navigate to /login","input[type=password] exists"],
  ["TC-029","Submit button enabled","/login","Form Fields","High","Navigate to /login","button[type=submit] isEnabled()"],
  ["TC-030","Empty form stays on /login","/login","Validation","High","Submit empty form","URL still /login"],
  ["TC-031","Invalid email stays on login","/login","Validation","High","Enter bad email, submit","URL still /login"],
  ["TC-032","Password field type=password","/login","Security","High","Navigate to /login","type attribute = 'password'"],
  ["TC-033","Forgot password link present","/login","Navigation","High","Navigate to /login","a[href=/forgot-password] exists"],
  ["TC-034","Forgot password link navigates","/login","Navigation","High","Click forgot password link","URL contains /forgot-password"],
  ["TC-035","Signup link present on login","/login","Navigation","Medium","Navigate to /login","a[href=/signup] exists"],
  ["TC-036","Signup link navigates","/login","Navigation","Medium","Click signup link","URL contains /signup"],
  ["TC-037","Valid login → /dashboard","/login","Authentication","Critical","Enter valid credentials, submit","URL contains /dashboard"],
  ["TC-038","Already logged in redirect","/login","Authentication","High","Navigate when logged in","Stays at /dashboard or /login"],
  ["TC-039","Email input has autocomplete","/login","Usability","Low","Navigate to /login","autocomplete attribute present"],
  ["TC-040","Enter key submits login","/login","Usability","Medium","Type credentials, press Enter","Navigates or stays on /login"],
  ["TC-041","Password not in URL","/login","Security","Critical","Submit valid login","URL does not contain password"],
  ["TC-042","Body has background color","/login","UI","Low","Navigate to /login","bg-color computed style is set"],
  ["TC-043","SQL injection in email rejected","/login","Security","Critical","Enter SQL payload, submit","No /dashboard redirect"],
  ["TC-044","XSS in email field safe","/login","Security","Critical","Enter XSS payload, submit","No /dashboard redirect"],
  ["TC-045","Whitespace-only email rejected","/login","Validation","High","Enter spaces in email, submit","No /dashboard redirect"],
  ["TC-046","Whitespace-only password handled","/login","Validation","Medium","Enter spaces in password, submit","Stays on /login or shows error"],
  ["TC-047","Tab keyboard navigation works","/login","Accessibility","Medium","Tab through inputs","Focus moves correctly"],
  ["TC-048","3 failed logins don't crash UI","/login","Stability","High","Fail login 3x","body still exists"],
  ["TC-049","Heading present on login","/login","UI Elements","Medium","Navigate to /login","h1 or h2 exists"],
  ["TC-050","Brand/logo on login page","/login","UI Elements","Medium","Navigate to /login","img/svg/.logo exists"],
  ["TC-051","No 404 on login","/login","Page Load","High","Navigate to /login","body text ≠ '404'"],
  ["TC-052","No 500 on login","/login","Page Load","High","Navigate to /login","body text ≠ '500'"],
  ["TC-053","Login loads within 5 s","/login","Performance","High","Navigate to /login and time","Load time < 5 s"],
  ["TC-054","Mobile 375px renders","/login","Responsive","Medium","Resize to 375px","body exists"],
  ["TC-055","No horizontal scroll","/login","Responsive","Medium","Navigate to /login","scrollWidth ≤ window.innerWidth"],
  ["TC-056","Form element present","/login","Form Fields","High","Navigate to /login","form tag exists"],
  ["TC-057","Wrong password stays on /login","/login","Authentication","High","Enter wrong password","URL still /login"],
  ["TC-058","Password type not text","/login","Security","High","Navigate to /login","type ≠ 'text'"],
  ["TC-059","Served over http(s)","/login","Infrastructure","High","Navigate to /login","URL starts with http"],
  ["TC-060","All links have href","/login","UI Elements","Low","Navigate to /login","All <a> tags have href attr"],
  ["TC-061","Submit button has label","/login","Accessibility","Medium","Navigate to /login","Button has text or aria-label"],
  ["TC-062","No undefined img src","/login","UI","Low","Navigate to /login","No img src contains 'undefined'"],
  ["TC-063","Tablet 768px renders","/login","Responsive","Low","Resize to 768px","body exists"],
  ["TC-064","1920px renders","/login","Responsive","Low","Resize to 1920px","body exists"],
  ["TC-065","320px renders","/login","Responsive","Low","Resize to 320px","body exists"],
  ["TC-066","Long password handled","/login","Validation","Medium","Enter 300-char password","No crash"],
  ["TC-067","Buttons are accessible","/login","Accessibility","Medium","Navigate to /login","All buttons have text or aria-label"],
  ["TC-068","Inputs have labels","/login","Accessibility","Medium","Navigate to /login","id/aria-label/placeholder present"],
  ["TC-069","Password not logged to console","/login","Security","High","Login, check browser logs","VALID_PASSWORD not in log messages"],
  ["TC-070","Body has meaningful text","/login","UI","Low","Navigate to /login","Body text length > 10"],
  ["TC-071","Spaces in email rejected","/login","Validation","High","Enter 'user @domain .com'","No /dashboard redirect"],
  ["TC-072","Reload keeps empty form","/login","Usability","Low","Navigate, refresh","email input still exists"],
  ["TC-073","Long email handled","/login","Validation","Medium","Enter 80-char email","No crash"],
  ["TC-074","Page title non-empty","/login","SEO","Low","Navigate to /login","getTitle() length > 0"],
  ["TC-075","Charset is UTF-8","/login","Internationalization","Low","Navigate to /login","document.charset contains 'utf'"],
];
s2Data.forEach(([id,name,page,cat,pri,steps,exp]) => add(id,"Suite 2: Login Page",name,page,cat,pri,steps,exp));

// ─── Suite 3: Signup ─────────────────────────────────────────────────────────
const s3Data = [
  ["TC-076","Signup page loads","/signup","Page Load","High","Navigate to /signup","URL contains /signup"],
  ["TC-077","Email input present","/signup","Form Fields","High","Navigate to /signup","input[type=email] exists"],
  ["TC-078","Password input present","/signup","Form Fields","High","Navigate to /signup","≥1 input[type=password]"],
  ["TC-079","Submit button present","/signup","Form Fields","High","Navigate to /signup","button[type=submit] exists"],
  ["TC-080","Empty form stays on /signup","/signup","Validation","High","Submit empty form","URL still /signup"],
  ["TC-081","Invalid email rejected","/signup","Validation","High","Enter bad email, submit","URL still /signup"],
  ["TC-082","Short password rejected","/signup","Validation","High","Enter 3-char password","No /dashboard redirect"],
  ["TC-083","Login link present","/signup","Navigation","Medium","Navigate to /signup","a[href=/login] exists"],
  ["TC-084","Login link navigates","/signup","Navigation","Medium","Click login link","URL contains /login"],
  ["TC-085","Heading present","/signup","UI Elements","Medium","Navigate to /signup","h1 or h2 exists"],
  ["TC-086","Brand/logo present","/signup","UI Elements","Medium","Navigate to /signup","img/svg/.logo exists"],
  ["TC-087","Duplicate email handled","/signup","Authentication","High","Re-register existing email","No crash"],
  ["TC-088","SQL injection safe","/signup","Security","Critical","Enter SQL payload","No crash, no DB error"],
  ["TC-089","Password fields masked","/signup","Security","High","Navigate to /signup","type=password"],
  ["TC-090","Keyboard navigation works","/signup","Accessibility","Medium","Tab through form","Focus moves"],
  ["TC-091","Loads within 5 s","/signup","Performance","High","Navigate and time","< 5 s"],
  ["TC-092","Mobile 375px","/signup","Responsive","Medium","Resize to 375px","body exists"],
  ["TC-093","No 404","/signup","Page Load","High","Navigate to /signup","body text ≠ '404'"],
  ["TC-094","Long email safe","/signup","Validation","Medium","Enter 100-char email","No crash"],
  ["TC-095","Form element present","/signup","Form Fields","High","Navigate to /signup","form tag exists"],
  ["TC-096","Mismatched passwords rejected","/signup","Validation","High","Enter different passwords","No /dashboard redirect"],
  ["TC-097","Valid signup shows result","/signup","Authentication","High","Register unique email","No crash"],
  ["TC-098","No 500","/signup","Page Load","High","Navigate to /signup","body text ≠ '500'"],
  ["TC-099","Tablet 768px","/signup","Responsive","Low","Resize to 768px","body exists"],
  ["TC-100","Title non-empty","/signup","SEO","Low","Navigate to /signup","getTitle() length > 0"],
];
s3Data.forEach(([id,name,page,cat,pri,steps,exp]) => add(id,"Suite 3: Signup Page",name,page,cat,pri,steps,exp));

// ─── Suite 4: Forgot Password ────────────────────────────────────────────────
const s4Data = [
  ["TC-101","Page loads","/forgot-password","Page Load","High","Navigate to /forgot-password","URL contains /forgot-password"],
  ["TC-102","Email input present","/forgot-password","Form Fields","High","Navigate","input[type=email] exists"],
  ["TC-103","Submit button present","/forgot-password","Form Fields","High","Navigate","button[type=submit] exists"],
  ["TC-104","Known email shows success","/forgot-password","Functionality","High","Enter valid email, submit","Success/sent message visible"],
  ["TC-105","Unknown email same response","/forgot-password","Security","Critical","Enter unknown email","No 'not found' text (no enumeration)"],
  ["TC-106","Empty email prevented","/forgot-password","Validation","High","Submit without email","Stays on /forgot-password"],
  ["TC-107","Invalid format rejected","/forgot-password","Validation","High","Enter 'notvalid'","Stays on /forgot-password"],
  ["TC-108","Back to login link","/forgot-password","Navigation","High","Navigate","a[href=/login] exists"],
  ["TC-109","Back to login navigates","/forgot-password","Navigation","High","Click back link","URL contains /login"],
  ["TC-110","Heading present","/forgot-password","UI Elements","Medium","Navigate","h1 or h2 exists"],
  ["TC-111","Brand present","/forgot-password","UI Elements","Medium","Navigate","img/svg/.logo exists"],
  ["TC-112","No 404","/forgot-password","Page Load","High","Navigate","body text ≠ '404'"],
  ["TC-113","No 500","/forgot-password","Page Load","High","Navigate","body text ≠ '500'"],
  ["TC-114","Mobile 375px","/forgot-password","Responsive","Medium","Resize to 375px","body exists"],
  ["TC-115","Loads <5 s","/forgot-password","Performance","High","Navigate and time","< 5 s"],
  ["TC-116","SQL injection safe","/forgot-password","Security","Critical","SQL in email field","No crash"],
  ["TC-117","XSS safe","/forgot-password","Security","Critical","XSS in email field","No script execution"],
  ["TC-118","At least one link","/forgot-password","Navigation","Low","Navigate","a tags > 0"],
  ["TC-119","Post-submit renders","/forgot-password","Functionality","High","Submit valid email, wait 4 s","UI renders without crash"],
  ["TC-120","Tablet 768px","/forgot-password","Responsive","Low","Resize to 768px","body exists"],
];
s4Data.forEach(([id,name,page,cat,pri,steps,exp]) => add(id,"Suite 4: Forgot Password",name,page,cat,pri,steps,exp));

// ─── Suite 5: Reset Password ─────────────────────────────────────────────────
const s5Data = [
  ["TC-121","No token redirects","/reset-password","Security","High","Navigate without token","Redirected to /forgot-password"],
  ["TC-122","Invalid token handled","/reset-password","Functionality","High","Navigate with bad token","No crash"],
  ["TC-123","With valid token renders","/reset-password","Page Load","High","Navigate with token=x","Renders without crash"],
  ["TC-124","Mismatched passwords rejected","/reset-password","Validation","High","Enter different passwords","No success / error shown"],
  ["TC-125","Heading present","/reset-password","UI Elements","Medium","Navigate with token","h1/h2 exists"],
  ["TC-126","Brand present","/reset-password","UI Elements","Medium","Navigate with token","img/svg/.logo exists"],
  ["TC-127","Short password rejected","/reset-password","Validation","High","Enter 3-char password","Error shown"],
  ["TC-128","Back to login link","/reset-password","Navigation","Medium","Navigate with token","a[href=/login] exists"],
  ["TC-129","Mobile 375px","/reset-password","Responsive","Medium","Resize, navigate","body exists"],
  ["TC-130","No 500","/reset-password","Page Load","High","Navigate with token","body text ≠ '500'"],
  ["TC-131","Token from URL param","/reset-password","Functionality","High","Navigate with ?token=myToken123","URL contains token="],
  ["TC-132","Real-time mismatch feedback","/reset-password","UX","Medium","Type mismatched passwords","Feedback shown"],
  ["TC-133","Tablet 768px","/reset-password","Responsive","Low","Resize to 768px","body exists"],
  ["TC-134","Success state renders","/reset-password","Functionality","High","On success","No crash"],
  ["TC-135","Loads <5 s","/reset-password","Performance","High","Navigate and time","< 5 s"],
  ["TC-136","No 404","/reset-password","Page Load","High","Navigate with token","body text ≠ '404'"],
  ["TC-137","Password fields masked","/reset-password","Security","High","Navigate with token","All inputs type=password"],
  ["TC-138","No submit without token","/reset-password","Security","High","Navigate without token","No submit or redirected"],
  ["TC-139","XSS token safe","/reset-password","Security","High","?token=<script>","No script execution"],
  ["TC-140","Empty token handled","/reset-password","Validation","Medium","?token=","No crash"],
];
s5Data.forEach(([id,name,page,cat,pri,steps,exp]) => add(id,"Suite 5: Reset Password",name,page,cat,pri,steps,exp));

// ─── Suite 6: Dashboard ──────────────────────────────────────────────────────
const s6Data = [
  ["TC-141","Dashboard loads","/dashboard","Page Load","Critical","Login, navigate","URL contains /dashboard"],
  ["TC-142","No 500 on dashboard","/dashboard","Page Load","Critical","Navigate","body text ≠ '500'"],
  ["TC-143","No 404 on dashboard","/dashboard","Page Load","Critical","Navigate","body text ≠ '404'"],
  ["TC-144","Sidebar/nav present","/dashboard","Navigation","High","Navigate","nav/aside/.sidebar exists"],
  ["TC-145","Loads <8 s","/dashboard","Performance","High","Navigate and time","< 8 s"],
  ["TC-146","Refresh keeps auth","/dashboard","Authentication","High","Navigate, refresh","URL still /dashboard"],
  ["TC-147","Mobile 375px","/dashboard","Responsive","Medium","Resize to 375px","body exists"],
  ["TC-148","Tablet 768px","/dashboard","Responsive","Medium","Resize to 768px","body exists"],
  ["TC-149","Back navigation","/dashboard","Navigation","Low","Go to /portfolio, back","No crash"],
  ["TC-150","/portfolio loads","/portfolio","Page Load","High","Navigate","URL contains /portfolio"],
  ["TC-151","/trading loads","/trading","Page Load","High","Navigate","URL contains /trading"],
  ["TC-152","/signals loads","/signals","Page Load","High","Navigate","URL contains /signals"],
  ["TC-153","/agents loads","/agents","Page Load","High","Navigate","URL contains /agents"],
  ["TC-154","/analytics loads","/analytics","Page Load","High","Navigate","URL contains /analytics"],
  ["TC-155","/backtesting loads","/backtesting","Page Load","High","Navigate","URL contains /backtesting"],
  ["TC-156","/history loads","/history","Page Load","High","Navigate","URL contains /history"],
  ["TC-157","/risk loads","/risk","Page Load","High","Navigate","URL contains /risk"],
  ["TC-158","/watchlist loads","/watchlist","Page Load","High","Navigate","URL contains /watchlist"],
  ["TC-159","/positions loads","/positions","Page Load","High","Navigate","URL contains /positions"],
  ["TC-160","/scanner loads","/scanner","Page Load","High","Navigate","URL contains /scanner"],
  ["TC-161","/notifications loads","/notifications","Page Load","Medium","Navigate","URL contains /notifications"],
  ["TC-162","/settings loads","/settings","Page Load","Medium","Navigate","URL contains /settings"],
  ["TC-163","/profile loads","/profile","Page Load","Medium","Navigate","URL contains /profile"],
  ["TC-164","Unknown sub-route handled","/dashboard/nonexistent","Error Handling","Medium","Navigate","No crash"],
  ["TC-165","No critical JS errors","/dashboard","Stability","High","Navigate, wait 2 s","No SEVERE browser errors (excl. WS)"],
];
s6Data.forEach(([id,name,page,cat,pri,steps,exp]) => add(id,"Suite 6: Dashboard",name,page,cat,pri,steps,exp));

// ─── Suite 7: Trading ────────────────────────────────────────────────────────
const s7Data = [
  ["TC-166","Trading loads","/trading","Page Load","High","Navigate","URL contains /trading"],
  ["TC-167","No 404","/trading","Page Load","High","Navigate","body ≠ '404'"],
  ["TC-168","No 500","/trading","Page Load","High","Navigate","body ≠ '500'"],
  ["TC-169","Heading present","/trading","UI Elements","Medium","Navigate","h1/h2/h3 exists"],
  ["TC-170","Loads <8 s","/trading","Performance","High","Navigate and time","< 8 s"],
  ["TC-171","Sidebar present","/trading","Navigation","Medium","Navigate","nav/aside exists"],
  ["TC-172","Meaningful content","/trading","Content","High","Navigate, wait 1.5 s","body text length > 100"],
  ["TC-173","Refresh keeps auth","/trading","Authentication","High","Navigate, refresh","URL still /trading"],
  ["TC-174","Tablet 768px","/trading","Responsive","Medium","Resize","body exists"],
  ["TC-175","Mobile 375px","/trading","Responsive","Medium","Resize","body exists"],
  ["TC-176","Chart or price element","/trading","UI Elements","Medium","Navigate, wait 2 s","canvas/svg/.chart exists"],
  ["TC-177","Buy/sell controls","/trading","UI Elements","Medium","Navigate","buy/sell button or class"],
  ["TC-178","Scroll to bottom","/trading","Usability","Low","Navigate, scroll","No crash"],
  ["TC-179","Page title non-empty","/trading","SEO","Low","Navigate","getTitle() length > 0"],
  ["TC-180","WS errors don't crash","/trading","Stability","High","Navigate, wait 3 s","body ≠ '500'"],
  ["TC-181","Nav to portfolio","/trading","Navigation","Medium","Navigate to /portfolio","URL changes"],
  ["TC-182","Input or select present","/trading","Form Fields","Low","Navigate","input/select exists"],
  ["TC-183","1920px renders","/trading","Responsive","Low","Resize","body exists"],
  ["TC-184","320px renders","/trading","Responsive","Low","Resize","body exists"],
  ["TC-185","Back navigation","/trading","Navigation","Low","Navigate, go back","No crash"],
];
s7Data.forEach(([id,name,page,cat,pri,steps,exp]) => add(id,"Suite 7: Trading Page",name,page,cat,pri,steps,exp));

// ─── Suite 8: Portfolio ──────────────────────────────────────────────────────
const s8Data = [
  ["TC-186","Loads","/portfolio","Page Load","High","Navigate","URL contains /portfolio"],
  ["TC-187","No 404","/portfolio","Page Load","High","Navigate","body ≠ '404'"],
  ["TC-188","No 500","/portfolio","Page Load","High","Navigate","body ≠ '500'"],
  ["TC-189","Loads <8 s","/portfolio","Performance","High","Navigate and time","< 8 s"],
  ["TC-190","Meaningful content","/portfolio","Content","High","Navigate, wait","body length > 50"],
  ["TC-191","Chart present","/portfolio","UI Elements","Medium","Navigate, wait 2 s","canvas/svg/.chart exists"],
  ["TC-192","Mobile 375px","/portfolio","Responsive","Medium","Resize","body exists"],
  ["TC-193","Refresh keeps auth","/portfolio","Authentication","High","Navigate, refresh","URL still /portfolio"],
  ["TC-194","Title non-empty","/portfolio","SEO","Low","Navigate","getTitle() length > 0"],
  ["TC-195","Sidebar present","/portfolio","Navigation","Medium","Navigate","nav/aside exists"],
  ["TC-196","Scrollable","/portfolio","Usability","Low","Scroll to bottom","No crash"],
  ["TC-197","Table or list present","/portfolio","UI Elements","Medium","Navigate, wait","table/.table/.list exists"],
  ["TC-198","Nav to trading","/portfolio","Navigation","Medium","Navigate to /trading","URL changes"],
  ["TC-199","Tablet 768px","/portfolio","Responsive","Low","Resize","body exists"],
  ["TC-200","No broken images","/portfolio","UI","Low","Navigate","No img src 'undefined'"],
];
s8Data.forEach(([id,name,page,cat,pri,steps,exp]) => add(id,"Suite 8: Portfolio Page",name,page,cat,pri,steps,exp));

// ─── Suite 9: Inner Dashboard Pages ─────────────────────────────────────────
const innerPages = [
  ["signals"],["agents"],["analytics"],["backtesting"],["risk"],
  ["history"],["watchlist"],["positions"],["scanner"],["notifications"]
];
let idx9 = 201;
for (const [lbl] of innerPages) {
  const page = "/" + lbl;
  add(tcN9(idx9++), "Suite 9: Inner Dashboard Pages", `${lbl} page loads`,    page, "Page Load",  "High",   `Navigate to ${page}`,             `URL contains ${page}`);
  add(tcN9(idx9++), "Suite 9: Inner Dashboard Pages", `${lbl} no 404`,       page, "Page Load",  "High",   `Navigate to ${page}`,             "body text ≠ '404'");
  add(tcN9(idx9++), "Suite 9: Inner Dashboard Pages", `${lbl} no 500`,       page, "Page Load",  "High",   `Navigate to ${page}`,             "body text ≠ '500'");
  add(tcN9(idx9++), "Suite 9: Inner Dashboard Pages", `${lbl} has content`,  page, "Content",   "Medium", `Navigate, wait 1.5 s`,             "body length > 50");
}
function tcN9(n) { return "TC-" + String(n).padStart(3,"0"); }

// ─── Suite 10: Settings & Profile ───────────────────────────────────────────
const s10Data = [
  ["TC-241","Settings loads","/settings","Page Load","High","Navigate","URL contains /settings"],
  ["TC-242","Settings no 404","/settings","Page Load","High","Navigate","body ≠ '404'"],
  ["TC-243","Settings no 500","/settings","Page Load","High","Navigate","body ≠ '500'"],
  ["TC-244","Settings <8 s","/settings","Performance","High","Navigate and time","< 8 s"],
  ["TC-245","Settings has interactive elements","/settings","UI Elements","Medium","Navigate, wait","input/select/switch exists"],
  ["TC-246","Settings scrollable","/settings","Usability","Low","Scroll to bottom","No crash"],
  ["TC-247","Settings mobile 375px","/settings","Responsive","Medium","Resize","body exists"],
  ["TC-248","Settings sidebar present","/settings","Navigation","Medium","Navigate","nav/aside exists"],
  ["TC-249","Toggle interaction safe","/settings","Functionality","Medium","Click a toggle","No crash"],
  ["TC-250","No broken images in settings","/settings","UI","Low","Navigate","No undefined img src"],
  ["TC-251","Profile loads","/profile","Page Load","High","Navigate","URL contains /profile"],
  ["TC-252","Profile no 404","/profile","Page Load","High","Navigate","body ≠ '404'"],
  ["TC-253","Profile no 500","/profile","Page Load","High","Navigate","body ≠ '500'"],
  ["TC-254","Profile <8 s","/profile","Performance","High","Navigate and time","< 8 s"],
  ["TC-255","Profile has user data","/profile","Content","High","Navigate, wait","body length > 50"],
  ["TC-256","Profile mobile 375px","/profile","Responsive","Medium","Resize","body exists"],
  ["TC-257","Profile edit capability","/profile","Functionality","Medium","Navigate","button/input/.edit exists"],
  ["TC-258","Profile tablet 768px","/profile","Responsive","Low","Resize","body exists"],
  ["TC-259","Notifications loads","/notifications","Page Load","Medium","Navigate","URL contains /notifications"],
  ["TC-260","Notifications has content","/notifications","Content","Medium","Navigate, wait","body length > 50"],
];
s10Data.forEach(([id,name,page,cat,pri,steps,exp]) => add(id,"Suite 10: Settings & Profile",name,page,cat,pri,steps,exp));

// ─── Suite 11: About, Features, Contact ─────────────────────────────────────
const s11Data = [
  ["TC-261","About loads","/about","Page Load","High","Navigate","URL contains /about"],
  ["TC-262","About no 404","/about","Page Load","High","Navigate","body ≠ '404'"],
  ["TC-263","About no 500","/about","Page Load","High","Navigate","body ≠ '500'"],
  ["TC-264","About heading","/about","UI Elements","Medium","Navigate","h1/h2 exists"],
  ["TC-265","About content > 100 chars","/about","Content","Medium","Navigate","body length > 100"],
  ["TC-266","About loads <5 s","/about","Performance","High","Navigate and time","< 5 s"],
  ["TC-267","About mobile 375px","/about","Responsive","Medium","Resize","body exists"],
  ["TC-268","Features loads","/features","Page Load","High","Navigate","URL contains /features"],
  ["TC-269","Features no 404","/features","Page Load","High","Navigate","body ≠ '404'"],
  ["TC-270","Features no 500","/features","Page Load","High","Navigate","body ≠ '500'"],
  ["TC-271","Features heading","/features","UI Elements","Medium","Navigate","h1/h2 exists"],
  ["TC-272","Features list/cards","/features","UI Elements","Medium","Navigate, wait","card/ul/li exists"],
  ["TC-273","Features <5 s","/features","Performance","High","Navigate and time","< 5 s"],
  ["TC-274","Features mobile","/features","Responsive","Medium","Resize","body exists"],
  ["TC-275","Contact loads","/contact","Page Load","High","Navigate","URL contains /contact"],
  ["TC-276","Contact no 404","/contact","Page Load","High","Navigate","body ≠ '404'"],
  ["TC-277","Contact no 500","/contact","Page Load","High","Navigate","body ≠ '500'"],
  ["TC-278","Contact has form or info","/contact","UI Elements","Medium","Navigate","form/input/address exists"],
  ["TC-279","Contact <5 s","/contact","Performance","High","Navigate and time","< 5 s"],
  ["TC-280","All 3 pages share nav","/about,/features,/contact","Navigation","Medium","Navigate all 3","nav/header exists on each"],
];
s11Data.forEach(([id,name,page,cat,pri,steps,exp]) => add(id,"Suite 11: About/Features/Contact",name,page,cat,pri,steps,exp));

// ─── Suite 12: API Endpoints ─────────────────────────────────────────────────
const s12Data = [
  ["TC-281","GET /api/auth/me unauthenticated → 401","/api/auth/me","API","Critical","Fetch without auth","status 401"],
  ["TC-282","POST /api/auth/login valid → 200","/api/auth/login","API","Critical","POST with valid creds","status 200 or 201"],
  ["TC-283","POST /api/auth/login bad → 401","/api/auth/login","API","Critical","POST with wrong pwd","status 401 or 400"],
  ["TC-284","POST /api/auth/forgot-password → 200","/api/auth/forgot-password","API","High","POST any email","status 200"],
  ["TC-285","POST /api/auth/reset-password bad token → 400","/api/auth/reset-password","API","High","POST invalid token","status 400"],
  ["TC-286","API returns JSON content-type","/api/auth/login","API","High","POST to login","content-type includes json"],
  ["TC-287","Auth cookie not accessible via JS","/","Security","Critical","Login, read document.cookie","cookie not exposed"],
  ["TC-288","/api/auth/me response has no password","/api/auth/me","Security","Critical","GET /api/auth/me","'password' key absent"],
  ["TC-289","Malformed JSON body → 400","/api/auth/login","API","High","POST malformed JSON","status ≥ 400"],
  ["TC-290","DELETE /api/auth/login → 405","/api/auth/login","API","Medium","DELETE request","status 405 or 4xx"],
  ["TC-291","Error response has 'error' key","/api/auth/login","API","Medium","POST wrong creds","JSON body has error key"],
  ["TC-292","Signup unique email → 201","/api/auth/signup","API","High","POST unique email","status 200 or 201"],
  ["TC-293","Signup duplicate → 4xx","/api/auth/signup","API","High","POST duplicate email","status ≥ 400"],
  ["TC-294","Very long body handled","/api/auth/login","API","Medium","POST 5000-char password","status ≥ 400"],
  ["TC-295","POST /api/auth/logout clears cookie","/api/auth/logout","API","High","POST logout","status 200"],
  ["TC-296","No stack traces in API errors","/api/auth/login","Security","High","POST null values","response has no 'at Object.'"],
  ["TC-297","GET /api/auth/me → 200 after login","/api/auth/me","API","High","Login, GET /api/auth/me","status 200"],
  ["TC-298","CORS headers present","/api/auth/me","API","Medium","Fetch /api/auth/me","CORS header in response"],
  ["TC-299","PUT /api/auth/login → 4xx","/api/auth/login","API","Medium","PUT request","status ≥ 400"],
  ["TC-300","Repeated /api/auth/me consistent","/api/auth/me","API","Low","3x fetch","status 200 each time"],
];
s12Data.forEach(([id,name,page,cat,pri,steps,exp]) => add(id,"Suite 12: API Endpoints",name,page,cat,pri,steps,exp));

// ─── Suite 13: Accessibility & Performance ───────────────────────────────────
const s13Data = [
  ["TC-301","Images have alt attributes","/","Accessibility","High","Navigate landing","All img tags have alt attr"],
  ["TC-302","Buttons have text or aria-label","/login","Accessibility","High","Navigate /login","All buttons labelled"],
  ["TC-303","HTML lang attribute set","/","Accessibility","Medium","Navigate landing","documentElement.lang set"],
  ["TC-304","Viewport meta set","/","Responsive","Medium","Navigate landing","viewport meta includes width=device-width"],
  ["TC-305","No horizontal scroll on landing","/","Responsive","Medium","Navigate landing","scrollWidth ≤ innerWidth"],
  ["TC-306","No horizontal scroll on login","/login","Responsive","Medium","Navigate /login","scrollWidth ≤ innerWidth"],
  ["TC-307","404 shown for unknown route","/unknown","Error Handling","High","Navigate to unknown route","404 or 'not found' text"],
  ["TC-308","404 page has home link","/unknown","Navigation","Medium","Navigate to unknown","a[href=/] exists"],
  ["TC-309","Landing page load < 10 s (perf API)","/","Performance","High","Navigate, read perf.timing","loadEventEnd - navigationStart < 10000"],
  ["TC-310","Login page load < 10 s (perf API)","/login","Performance","High","Navigate, read perf.timing","loadEventEnd - navigationStart < 10000"],
];
s13Data.forEach(([id,name,page,cat,pri,steps,exp]) => add(id,"Suite 13: Accessibility & Performance",name,page,cat,pri,steps,exp));

// ─── Build Excel workbook ─────────────────────────────────────────────────────
(async () => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "QuantAI E2E Test Generator";
  workbook.created = new Date();

  // ── Summary sheet ──────────────────────────────────────────────────────────
  const summarySheet = workbook.addWorksheet("Summary", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  summarySheet.columns = [
    { header: "Suite",          key: "suite",  width: 38 },
    { header: "Test Count",     key: "count",  width: 12 },
    { header: "TC Range",       key: "range",  width: 18 },
    { header: "Coverage Area",  key: "area",   width: 35 },
    { header: "Priority Focus", key: "pri",    width: 18 },
  ];

  const summaryData = [
    ["Suite 1: Landing Page",               25,  "TC-001 – TC-025", "Navigation, SEO, Responsive, Performance",         "High"],
    ["Suite 2: Login Page",                 50,  "TC-026 – TC-075", "Auth, Validation, Security, Responsive, A11y",     "Critical"],
    ["Suite 3: Signup Page",                25,  "TC-076 – TC-100", "Auth, Validation, Security, Responsive",           "High"],
    ["Suite 4: Forgot Password",            20,  "TC-101 – TC-120", "Functionality, Security, Responsive",              "High"],
    ["Suite 5: Reset Password",             20,  "TC-121 – TC-140", "Functionality, Security, Validation",              "High"],
    ["Suite 6: Dashboard (Authenticated)",  25,  "TC-141 – TC-165", "Auth, Navigation, Page Load, Stability",           "Critical"],
    ["Suite 7: Trading Page",               20,  "TC-166 – TC-185", "Page Load, UI, Responsive, Stability",             "High"],
    ["Suite 8: Portfolio Page",             15,  "TC-186 – TC-200", "Page Load, UI, Content, Auth",                     "High"],
    ["Suite 9: Inner Dashboard Pages",      40,  "TC-201 – TC-240", "Page Load, Content (10 routes × 4 tests)",         "High"],
    ["Suite 10: Settings & Profile",        20,  "TC-241 – TC-260", "Functionality, Responsive, UI",                    "Medium"],
    ["Suite 11: About / Features / Contact",20,  "TC-261 – TC-280", "Page Load, Content, Navigation, Performance",      "Medium"],
    ["Suite 12: API Endpoints",             20,  "TC-281 – TC-300", "REST API, Security, Error Handling",               "Critical"],
    ["Suite 13: Accessibility & Performance",10, "TC-301 – TC-310", "Accessibility, Responsive, Performance Timing",    "High"],
  ];

  summaryData.forEach(row => summarySheet.addRow({
    suite: row[0], count: row[1], range: row[2], area: row[3], pri: row[4],
  }));

  // Style header row
  summarySheet.getRow(1).font     = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  summarySheet.getRow(1).fill     = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A3C5E" } };
  summarySheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
  summarySheet.getRow(1).height   = 20;

  // Alternating row colors
  summarySheet.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    const fill = rowNum % 2 === 0
      ? { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F0F7" } }
      : { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };
    row.eachCell(cell => { cell.fill = fill; });
  });

  // Total row
  summarySheet.addRow({ suite: "TOTAL", count: TESTS.length, range: "TC-001 – TC-310", area: "Full platform E2E coverage", pri: "Mixed" });
  const totalRow = summarySheet.lastRow;
  totalRow.font = { bold: true, size: 11 };
  totalRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2E7D32" } };
  totalRow.getCell("suite").font = { bold: true, color: { argb: "FFFFFFFF" } };
  totalRow.getCell("count").font = { bold: true, color: { argb: "FFFFFFFF" } };
  totalRow.getCell("range").font = { bold: true, color: { argb: "FFFFFFFF" } };
  totalRow.getCell("area").font  = { bold: true, color: { argb: "FFFFFFFF" } };
  totalRow.getCell("pri").font   = { bold: true, color: { argb: "FFFFFFFF" } };

  summarySheet.addRow([]);
  summarySheet.addRow({ suite: "Generated", count: "", range: new Date().toISOString(), area: "QuantAI Trading Platform E2E Test Suite", pri: "" });

  // ── Test Cases sheet ───────────────────────────────────────────────────────
  const detailSheet = workbook.addWorksheet("Test Cases", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  detailSheet.columns = [
    { header: "Test ID",        key: "id",              width: 10 },
    { header: "Suite",          key: "suite",           width: 36 },
    { header: "Test Name",      key: "name",            width: 44 },
    { header: "Page / Route",   key: "page",            width: 22 },
    { header: "Category",       key: "category",        width: 20 },
    { header: "Priority",       key: "priority",        width: 11 },
    { header: "Automation Type",key: "automationType",  width: 20 },
    { header: "Test Steps",     key: "steps",           width: 38 },
    { header: "Expected Result",key: "expected",        width: 38 },
    { header: "Status",         key: "status",          width: 12 },
    { header: "Notes",          key: "notes",           width: 25 },
  ];

  // Header style
  detailSheet.getRow(1).font     = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  detailSheet.getRow(1).fill     = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A3C5E" } };
  detailSheet.getRow(1).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  detailSheet.getRow(1).height   = 22;

  // Priority color map
  const priColor = { Critical: "FFFF0000", High: "FFFF6600", Medium: "FFFFC000", Low: "FF70AD47" };

  TESTS.forEach((tc, i) => {
    const row = detailSheet.addRow(tc);
    row.alignment = { vertical: "middle", wrapText: true };
    row.height    = 20;

    // Alternating BG
    const bg = i % 2 === 0 ? "FFE8F0F7" : "FFFFFFFF";
    row.eachCell(cell => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
      cell.border = {
        top:    { style: "thin", color: { argb: "FFD0D0D0" } },
        bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
        left:   { style: "thin", color: { argb: "FFD0D0D0" } },
        right:  { style: "thin", color: { argb: "FFD0D0D0" } },
      };
    });

    // Priority cell color
    const priCell = row.getCell("priority");
    priCell.font = { bold: true, color: { argb: priColor[tc.priority] || "FF000000" } };

    // Status cell style
    const statusCell = row.getCell("status");
    statusCell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E0E0" } };
    statusCell.font  = { italic: true };
  });

  // Auto-filter
  detailSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to:   { row: 1, column: detailSheet.columns.length },
  };

  // ── Statistics sheet ───────────────────────────────────────────────────────
  const statsSheet = workbook.addWorksheet("Statistics");
  statsSheet.columns = [
    { header: "Metric", key: "metric", width: 32 },
    { header: "Value",  key: "value",  width: 20 },
  ];
  statsSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  statsSheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A3C5E" } };

  const categories = {};
  const priorities = {};
  TESTS.forEach(t => {
    categories[t.category]  = (categories[t.category] || 0) + 1;
    priorities[t.priority]  = (priorities[t.priority] || 0) + 1;
  });

  statsSheet.addRow({ metric: "Total Test Cases", value: TESTS.length });
  statsSheet.addRow({ metric: "Total Suites",     value: 13 });
  statsSheet.addRow({ metric: "Framework",        value: "Selenium WebDriver + Mocha" });
  statsSheet.addRow({ metric: "Browser",          value: "Chrome (headless)" });
  statsSheet.addRow({ metric: "Base URL",         value: "http://localhost:3000" });
  statsSheet.addRow({});
  statsSheet.addRow({ metric: "─── Priority Breakdown ───", value: "" });
  Object.entries(priorities).forEach(([k,v]) => statsSheet.addRow({ metric: k, value: v }));
  statsSheet.addRow({});
  statsSheet.addRow({ metric: "─── Category Breakdown ───", value: "" });
  Object.entries(categories).forEach(([k,v]) => statsSheet.addRow({ metric: k, value: v }));

  // ── Save ───────────────────────────────────────────────────────────────────
  const outPath = path.join(__dirname, "QuantAI_E2E_Test_Report.xlsx");
  await workbook.xlsx.writeFile(outPath);
  console.log("✓ Excel report written:", outPath);
  console.log("  Sheets : Summary, Test Cases, Statistics");
  console.log("  Rows   :", TESTS.length, "test cases");
})();
