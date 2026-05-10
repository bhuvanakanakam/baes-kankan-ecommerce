-- ============================================================
-- Add More Products to webData
-- Run this in SSMS if your DB already has the original 10 products
-- ============================================================

USE webData;
GO

-- Only insert new products that don't already exist
IF NOT EXISTS (SELECT 1 FROM Products WHERE ProductName = 'Channel Ballet Flats')
BEGIN
    INSERT INTO Products (CategoryID, ProductName, Price, ImagePath, Rating, StockQty) VALUES

    -- ── More Shoes (CategoryID = 1) ─────────────────────────────
    (1, 'Channel Ballet Flats',           32000.00, 'img/products/channel.png',     4.8, 12),
    (1, 'Aldo Strappy Heels',              4500.00, 'img/products/aldo.png',        4.7, 30),
    (1, 'Coach Leather Loafers',          18500.00, 'img/products/coach.png',       4.9, 18),
    (1, 'Polo Ralph Lauren Boat Shoes',    8900.00, 'img/products/polo-ralph.png',  4.8, 22),

    -- ── More Bags (CategoryID = 2) ──────────────────────────────
    (2, 'Burberry Crossbody Bag',         38000.00, 'img/products/burberry.png',    4.9, 10),
    (2, 'Celine Mini Luggage Bag',        95000.00, 'img/products/celine.png',      5.0,  6),
    (2, 'New Balance Gym Duffle',          5500.00, 'img/products/new-balance.png', 4.6, 28),

    -- ── More Apparel (CategoryID = 3) ───────────────────────────
    (3, 'Burberry Nova Check Scarf',      24000.00, 'img/products/burberry.png',    4.9, 14),
    (3, 'Polo Ralph Lauren Oxford Shirt',  6500.00, 'img/products/polo-ralph.png',  4.8, 25),
    (3, 'Channel Tweed Blazer',           85000.00, 'img/products/channel.png',     5.0,  5),
    (3, 'Coach Leather Jacket',           42000.00, 'img/products/coach.png',       4.7,  8),

    -- ── More Accessories (CategoryID = 4) ───────────────────────
    (4, 'Fetch Layered Necklace',          2200.00, 'img/products/fetch.png',       4.8, 45),
    (4, 'Daniel Wellington Petite Watch',  9500.00, 'img/products/daniel.png',      4.9, 20),
    (4, 'Burberry Check Belt',            18000.00, 'img/products/burberry.png',    4.7, 16),
    (4, 'Celine Cat-Eye Frames',          35000.00, 'img/products/celine.png',      4.8, 10),

    -- ── Make Up (CategoryID = 5) ────────────────────────────────
    (5, 'Channel No. 5 Eau de Parfum',    22000.00, 'img/products/channel.png',     5.0, 30),
    (5, 'Celine Lip Gloss Set',            4800.00, 'img/products/celine.png',      4.8, 40),
    (5, 'Fetch Glow Highlighter Palette',  1900.00, 'img/products/fetch.png',       4.7, 55),
    (5, 'Burberry Fresh Glow Foundation',  6500.00, 'img/products/burberry.png',    4.9, 35),
    (5, 'Coach Velvet Lipstick Set',       3200.00, 'img/products/coach.png',       4.6, 38);

    PRINT '20 new products added successfully!';
END
ELSE
BEGIN
    PRINT 'New products already exist. No changes made.';
END
GO

-- Verify
SELECT c.CategoryName, COUNT(*) AS ProductCount
FROM Products p
JOIN Categories c ON p.CategoryID = c.CategoryID
GROUP BY c.CategoryName
ORDER BY c.CategoryName;

SELECT COUNT(*) AS TotalProducts FROM Products;
GO
