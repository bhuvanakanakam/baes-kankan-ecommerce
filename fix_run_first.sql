-- ============================================================
-- STEP 1: Run THIS file first in SSMS before anything else
-- It creates the webData database and cleans up the stray
-- Users table that was created in the wrong database.
-- ============================================================

-- 1A. Create the webData database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'webData')
BEGIN
    CREATE DATABASE webData;
    PRINT '✅ Database [webData] created.';
END
ELSE
BEGIN
    PRINT 'ℹ️  Database [webData] already exists.';
END
GO

-- 1B. Remove the stray Users table that got created in the wrong
--     database context during the failed run (likely in [master])
IF EXISTS (
    SELECT 1 FROM sys.tables
    WHERE name = 'Users'
      AND SCHEMA_NAME(schema_id) = 'dbo'
)
BEGIN
    DROP TABLE dbo.Users;
    PRINT '🧹 Stray [Users] table removed from current database.';
END
GO

-- 1C. Switch into webData and verify it is empty/ready
USE webData;
GO

PRINT '✅ Now using [webData] database.';
PRINT '👉 You can now run your main websiteDataT...ot script — it should work cleanly.';
GO
