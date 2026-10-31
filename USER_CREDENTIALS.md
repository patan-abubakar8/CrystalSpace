# CrystalSpace - User Credentials Directory

This document contains all 25 seeded user accounts across the 5 system roles in **CrystalSpace**. 

Each role has **5 fully provisioned accounts** with active user authentication, bcrypt hashed credentials, linked employee profiles, departments, and active attendance sessions.

---

## Quick Login Information

- **Frontend URL:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:8080](http://localhost:8080)
- **Status:** All 25 accounts are active and immediately accessible.

---

## 1. SuperAdmin Accounts (5 Users)

> **Privilege Level:** Full unrestricted master bypass across all platform modules, including Dynamic Roles & Permissions Matrix.

| # | Full Name | Email | Password | Department | Designation | Employee Code | Work Mode |
|---|---|---|---|---|---|---|---|
| 1 | Abubakar Patan | `superadmin@organize.com` | `Admin@123` | Administration | Chief Technology Officer | CS-SA01 | Office |
| 2 | Alexander Vance | `superadmin2@organize.com` | `SuperAdmin@123` | Administration | Principal Cloud Architect | CS-SA02 | Hybrid |
| 3 | Elena Rostova | `superadmin3@organize.com` | `SuperAdmin@123` | Administration | VP of Infrastructure & Security | CS-SA03 | Remote |
| 4 | Marcus Chen | `superadmin4@organize.com` | `SuperAdmin@123` | Administration | Chief Information Security Officer | CS-SA04 | Office |
| 5 | Sarah Jenkins | `superadmin5@organize.com` | `SuperAdmin@123` | Administration | Director of Systems Engineering | CS-SA05 | Hybrid |

---

## 2. Admin Accounts (5 Users)

> **Privilege Level:** Executive workforce management, full CRUD on employees, departments, projects, salaries, leaves, and attendance.

| # | Full Name | Email | Password | Department | Designation | Employee Code | Work Mode |
|---|---|---|---|---|---|---|---|
| 1 | David Miller | `admin1@organize.com` | `Admin@123` | Administration | Chief Operating Officer | CS-AD01 | Office |
| 2 | Sophia Taylor | `admin2@organize.com` | `Admin@123` | Administration | VP of Global Operations | CS-AD02 | Hybrid |
| 3 | James Wilson | `admin3@organize.com` | `Admin@123` | Administration | Director of Corporate Strategy | CS-AD03 | Remote |
| 4 | Olivia Martinez | `admin4@organize.com` | `Admin@123` | Administration | General Operations Manager | CS-AD04 | Office |
| 5 | William Anderson | `admin5@organize.com` | `Admin@123` | Administration | Executive Operations Director | CS-AD05 | Hybrid |

---

## 3. Human Resources (HR) Accounts (5 Users)

> **Privilege Level:** Personnel lifecycle, onboarding, department management, leave reviews/approvals, salary configurations, and attendance logs.

| # | Full Name | Email | Password | Department | Designation | Employee Code | Work Mode |
|---|---|---|---|---|---|---|---|
| 1 | Priya Sharma | `hr@organize.com` | `HR@123` | Human Resources | Chief People Officer | CS-HR01 | Office |
| 2 | Rachel Green | `hr2@organize.com` | `HR@123` | Human Resources | HR Business Partner | CS-HR02 | Hybrid |
| 3 | Daniel Craig | `hr3@organize.com` | `HR@123` | Human Resources | Talent Acquisition Lead | CS-HR03 | Remote |
| 4 | Ananya Verma | `hr4@organize.com` | `HR@123` | Human Resources | People Operations Specialist | CS-HR04 | Office |
| 5 | Michael Scott | `hr5@organize.com` | `HR@123` | Human Resources | Employee Relations Manager | CS-HR05 | Hybrid |

---

## 4. Manager Accounts (5 Users)

> **Privilege Level:** Team operations, leave requests review & approval, project and task assignment, and department attendance visibility.

| # | Full Name | Email | Password | Department | Designation | Employee Code | Work Mode |
|---|---|---|---|---|---|---|---|
| 1 | Vikram Malhotra | `manager1@organize.com` | `Manager@123` | Engineering | Engineering Director | CS-MG01 | Office |
| 2 | Carlos Santana | `manager2@organize.com` | `Manager@123` | Engineering | Software Development Manager | CS-MG02 | Hybrid |
| 3 | Emily Watson | `manager3@organize.com` | `Manager@123` | Engineering | Product Delivery Manager | CS-MG03 | Remote |
| 4 | Rohan Joshi | `manager4@organize.com` | `Manager@123` | Sales | Enterprise Sales Lead | CS-MG04 | Office |
| 5 | Jessica Pearson | `manager5@organize.com` | `Manager@123` | Sales | Client Solutions Manager | CS-MG05 | Hybrid |

---

## 5. Employee Accounts (5 Users)

> **Privilege Level:** Self-service portal, real-time live attendance clock in/out, personal work mode selector, attendance heatmap, leave application, and task progress.

| # | Full Name | Email | Password | Department | Designation | Employee Code | Work Mode |
|---|---|---|---|---|---|---|---|
| 1 | Ahmed Khan | `employee1@organize.com` | `Employee@123` | Engineering | Senior Full Stack Engineer | CS-EM01 | Hybrid |
| 2 | Maya Patel | `employee2@organize.com` | `Employee@123` | Engineering | Frontend UI/UX Developer | CS-EM02 | Remote |
| 3 | Lucas Silva | `employee3@organize.com` | `Employee@123` | Engineering | Backend Systems Engineer | CS-EM03 | Office |
| 4 | Chloe Bennett | `employee4@organize.com` | `Employee@123` | Engineering | DevOps & Cloud SRE Engineer | CS-EM04 | Hybrid |
| 5 | Nathan Drake | `employee5@organize.com` | `Employee@123` | Sales | Technical Solutions Specialist | CS-EM05 | Office |

---

## How to Test and Log In

1. Open your browser and navigate to **[http://localhost:5173](http://localhost:5173)**.
2. If already logged in, click your user avatar on the bottom of the sidebar or flyout and select **Sign Out**.
3. On the Login screen, enter any of the email addresses and passwords listed in the tables above.
4. Click **Sign In**.
5. The application will authenticate against the PostgreSQL database, generate a signed JWT, load the user's role-based page permissions, and redirect directly into the Dashboard.

---

## Re-running or Updating Seeds

If you ever need to reset or re-seed the users, run the standalone Go seeder script:

```bash
cd Backend
go run ./cmd/seed_users
```
