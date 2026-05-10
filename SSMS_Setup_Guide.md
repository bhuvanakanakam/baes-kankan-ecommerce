# SSMS Setup Guide — WebsiteDB

Follow these steps to connect SSMS to your local SQL Server and get the ecommerce database running.

---

## Step 1: Open SSMS and Connect

1. Open **SQL Server Management Studio (SSMS)** from your Start Menu
2. In the **Connect to Server** dialog:
   - **Server type:** Database Engine
   - **Server name:** `localhost` or `.\SQLEXPRESS` (for SQL Server Express)
   - **Authentication:** Windows Authentication (or SQL Server Authentication with your credentials)
3. Click **Connect**

> **Tip:** If connection fails, try these server names:
> - `localhost`
> - `(local)`
> - `.\SQLEXPRESS`
> - `DESKTOP-XXXXX\SQLEXPRESS` (your computer name + \SQLEXPRESS)

---

## Step 2: Open the SQL Script

1. In SSMS, click **File → Open → File...**
2. Browse to your **Ecommerce Website** folder
3. Select **`websitedb_setup.sql`** and click **Open**

---

## Step 3: Run the Script

1. Make sure the script is open in the query editor
2. Click **Execute** (or press **F5**)
3. Watch the **Messages** pane at the bottom — you should see:
   ```
   Database [WebsiteDB] created successfully.
   Table [Categories] created.
   Table [Products] created.
   Table [Customers] created.
   Table [Orders] created.
   Table [OrderItems] created.
   Categories seeded successfully.
   Products seeded successfully.
   Sample customers seeded successfully.
   --- Setup Complete! WebsiteDB is ready to use. ---
   ```

---

## Step 4: Verify the Database

After running, check the **Results** tab — you should see two tables:

**Table 1 — Record Counts:**
| TableName  | RecordCount |
|------------|-------------|
| Categories | 5           |
| Products   | 10          |
| Customers  | 2           |
| Orders     | 0           |

**Table 2 — Products List:**
All 10 products from the website with their categories and prices.

---

## Step 5: Browse in Object Explorer

In the left **Object Explorer** panel:
1. Expand **Databases**
2. You should see **WebsiteDB** listed
3. Expand it → **Tables** → you'll see:
   - dbo.Categories
   - dbo.Customers
   - dbo.OrderItems
   - dbo.Orders
   - dbo.Products

Right-click any table → **Select Top 1000 Rows** to view the data.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Can't connect to server | Try `.\SQLEXPRESS` as server name |
| SQL Server not installed | Download from [microsoft.com/sql-server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (Express is free) |
| Script runs but no data | Check Messages tab for errors, re-run |
| Tables already exist | Safe to re-run — script checks before creating |

---

## Database Connection String (for backend use)

If you later want to connect a backend (Node.js / ASP.NET) to this database:

```
Server=localhost;Database=WebsiteDB;Trusted_Connection=True;
```

Or with SQL login:
```
Server=localhost;Database=WebsiteDB;User Id=sa;Password=YourPassword;
```
