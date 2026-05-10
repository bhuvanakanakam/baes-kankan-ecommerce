-- ============================================================
-- ISW Ecommerce Website - Database Setup Script
-- Database: WebsiteDB
-- Compatible with: SQL Server 2016+ / SSMS
-- Run this in SSMS to create and populate the database
-- ============================================================

-- Step 1: Create the database (skip if it already exists)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'WebsiteDB')
BEGIN
    CREATE DATABASE WebsiteDB;
    PRINT 'Database [WebsiteDB] created successfully.';
END
ELSE
BEGIN
    PRINT 'Database [WebsiteDB] already exists. Skipping creation.';
END
GO

USE WebsiteDB;
GO

-- ============================================================
-- Step 2: Create Tables
-- ============================================================

-- Categories Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Categories')
BEGIN
    CREATE TABLE Categories (
        CategoryID   INT IDENTITY(1,1) PRIMARY KEY,
        CategoryName NVARCHAR(100) NOT NULL,
        ImagePath    NVARCHAR(255),
        CreatedAt    DATETIME DEFAULT GETDATE()
    );
    PRINT 'Table [Categories] created.';
END
GO

-- Products Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Products')
BEGIN
    CREATE TABLE Products (
        ProductID    INT IDENTITY(1,1) PRIMARY KEY,
        CategoryID   INT FOREIGN KEY REFERENCES Categories(CategoryID),
        ProductName  NVARCHAR(200) NOT NULL,
        Description  NVARCHAR(600),
        Price        DECIMAL(10, 2) NOT NULL,
        ImagePath    NVARCHAR(500),
        Rating       DECIMAL(2, 1) DEFAULT 5.0,
        StockQty     INT DEFAULT 100,
        IsActive     BIT DEFAULT 1,
        CreatedAt    DATETIME DEFAULT GETDATE()
    );
    PRINT 'Table [Products] created.';
END
GO

-- Customers Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Customers')
BEGIN
    CREATE TABLE Customers (
        CustomerID   INT IDENTITY(1,1) PRIMARY KEY,
        FirstName    NVARCHAR(100) NOT NULL,
        LastName     NVARCHAR(100) NOT NULL,
        Email        NVARCHAR(200) UNIQUE NOT NULL,
        Phone        NVARCHAR(20),
        Address      NVARCHAR(500),
        CreatedAt    DATETIME DEFAULT GETDATE()
    );
    PRINT 'Table [Customers] created.';
END
GO

-- Orders Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Orders')
BEGIN
    CREATE TABLE Orders (
        OrderID      INT IDENTITY(1,1) PRIMARY KEY,
        CustomerID   INT FOREIGN KEY REFERENCES Customers(CustomerID),
        OrderDate    DATETIME DEFAULT GETDATE(),
        TotalAmount  DECIMAL(10, 2) NOT NULL,
        Status       NVARCHAR(50) DEFAULT 'Pending',
        ShippingAddr NVARCHAR(500)
    );
    PRINT 'Table [Orders] created.';
END
GO

-- OrderItems Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OrderItems')
BEGIN
    CREATE TABLE OrderItems (
        OrderItemID  INT IDENTITY(1,1) PRIMARY KEY,
        OrderID      INT FOREIGN KEY REFERENCES Orders(OrderID),
        ProductID    INT FOREIGN KEY REFERENCES Products(ProductID),
        Quantity     INT NOT NULL DEFAULT 1,
        UnitPrice    DECIMAL(10, 2) NOT NULL
    );
    PRINT 'Table [OrderItems] created.';
END
GO

-- ============================================================
-- Step 3: Seed Categories
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM Categories)
BEGIN
    INSERT INTO Categories (CategoryName, ImagePath) VALUES
    ('Shoes',       'img/category/shoe.png'),
    ('Bags',        'img/category/bags.png'),
    ('Apparel',     'img/category/apperal.png'),
    ('Accessories', 'img/category/access.png'),
    ('Make Up',     'img/category/make-up.png');
    PRINT 'Categories seeded successfully.';
END
GO

-- ============================================================
-- Step 4: Seed Products (from website listings)
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM Products)
BEGIN
    INSERT INTO Products (CategoryID, ProductName, Description, Price, ImagePath, Rating, StockQty) VALUES
    -- ── Shoes (CategoryID = 1) ──────────────────────────────────
    (1, 'UGG Classic Boots',              'The iconic UGG Classic Boot in chestnut. Twin-faced sheepskin upper keeps feet warm and dry, with a Treadlite by UGG outsole for lightweight cushioning all day long. A wardrobe staple since 1978.',
     7000.00, 'https://dms.deckers.com/ugg/image/upload/t_product-xlarge-wp/v1770062263/1016223-CHE_1.png', 5.0, 50),

    (1, 'New Balance 574 Sneakers',       'The heritage New Balance 574 in sage green. Features ENCAP midsole cushioning, a pigskin suede and mesh upper, and the classic NB heel patch. Timeless streetwear silhouette built for all-day wear.',
     11700.00, 'https://nb.scene7.com/is/image/NB/ml574evg_nb_02_i?$pdpflexf2$&wid=600&hei=600', 5.0, 40),

    (1, 'Channel Ballet Flats',           'Chanel slingback ballet flats in ivory grosgrain. Signature CC logo cap-toe detail, leather-lined interior, and a delicate block heel. Parisian refinement distilled into a single, effortless shoe.',
     32000.00, 'https://www.chanel.com/images///f_auto,q_auto:good,dpr_1.1/w_1024/-9543237795870.jpg', 4.8, 12),

    (1, 'Aldo Strappy Heels',             'Aldo strappy block-heeled sandals with an adjustable ankle strap. Cushioned insole, 3.5-inch stable block heel, and a sleek minimal silhouette. The after-five shoe that goes with everything.',
     4500.00, 'https://m.media-amazon.com/images/I/71d0bRgTy2L._AC_SR768,1024_.jpg', 4.7, 30),

    (1, 'Coach Leather Loafers',          'Coach Wylie loafer in burnished refined calf leather. Signature horse-and-carriage hardware accent, full leather lining, and a leather outsole. A timeless slip-on that works from desk to dinner.',
     18500.00, 'https://coach.scene7.com/is/image/Coach/cm752_bka_a0?$desktopProduct$', 4.9, 18),

    (1, 'Polo Ralph Lauren Boat Shoes',   'Classic Polo Ralph Lauren boat shoes in tan leather. Hand-sewn moccasin construction, 360-degree rawhide lacing, and a non-marking rubber outsole. Preppy heritage with the unmistakable Ralph Lauren touch.',
     8900.00, 'https://dtcralphlauren.scene7.com/is/image/PoloGSI/s7-AI803932996002_lifestyle?$rl_4x5_zoom$', 4.8, 22),

    -- ── Bags (CategoryID = 2) ───────────────────────────────────
    (2, 'Coach Signature Handbag',        'Coach Charter crossbody in signature canvas with refined leather trim. Features an interior zip pocket and multifunction slip pockets. Adjustable strap converts seamlessly from crossbody to shoulder carry.',
     22000.00, 'https://coach.scene7.com/is/image/Coach/ci032_b4ydt_a0?$desktopProduct$', 5.0, 20),

    (2, 'Aldo Tote Bag',                  'Aldo structured tote in premium vegan leather. Spacious zip-top interior with organiser pockets, twin shoulder straps, and magnetic snap closure. From the laptop to the weekend, it carries it all.',
     10000.00, 'https://n.nordstrommedia.com/it/dfd7bccc-1c4b-4ac7-b5fc-85bafb590425.jpeg', 5.0, 35),

    (2, 'Burberry Crossbody Bag',         'Burberry TB Mini Bag in smooth calfskin leather. Engraved Thomas Burberry monogram hardware, detachable gold-tone chain strap, and suede interior lining. Compact yet commanding, day to evening.',
     38000.00, 'https://assets.burberry.com/is/image/Burberryltd/BF45A6F5-F4B5-4036-A2A0-26F505F93147', 4.9, 10),

    (2, 'Celine Mini Luggage Bag',        'Celine Mini Luggage in black smooth calfskin. The iconic structured silhouette with wrap-around handles and the Celine Paris embossed stamp. A coveted collector''s piece from the house of Celine.',
     95000.00, 'https://www.celine.com/on/demandware.static/-/Library-Sites-Celine-SharedLibrary/default/dwcc02f88d/categories/menu/A00020_LUGGAGE_L100E3GW2.28BK_NV.jpg', 5.0, 6),

    (2, 'New Balance Gym Duffle',         'New Balance Athletics gym duffel bag in bold colourway. Spacious main compartment, ventilated shoe pocket, padded adjustable shoulder strap, and side water bottle pocket. Train in style.',
     5500.00, 'https://nb.scene7.com/is/image/NB/ac4497ktre_nb_03_i?$pdpflexf2$&wid=600&hei=600', 4.6, 28),

    -- ── Apparel (CategoryID = 3) ────────────────────────────────
    (3, 'Polo Ralph Lauren Sweater',      'Polo Ralph Lauren merino wool crewneck sweater. Ribbed cuffs and hem, iconic embroidered pony at the chest, and a slim-fit silhouette. Soft, warm, and effortlessly put-together for any season.',
     3000.00, 'https://dtcralphlauren.scene7.com/is/image/PoloGSI/s7-1396676_alternate10?$rl_4x5_zoom$', 5.0, 30),

    (3, 'Burberry Nova Check Scarf',      'Burberry''s iconic Nova Check scarf woven in pure cashmere. The heritage camel, black, and red tartan pattern is a British institution. Generously sized, ultra-soft, and endlessly versatile.',
     24000.00, 'https://assets.burberry.com/is/image/Burberryltd/BD1DDEF4-EAAF-423B-9535-D6CE561FF680', 4.9, 14),

    (3, 'Polo Ralph Lauren Oxford Shirt', 'The Polo Ralph Lauren classic-fit Oxford shirt in soft-washed cotton poplin. Button-down collar, chest pocket, and signature embroidered pony. The essential smart-casual shirt for every wardrobe.',
     6500.00, 'https://m.media-amazon.com/images/I/71MLnSYrzjL._AC_SR736,920_.jpg', 4.8, 25),

    (3, 'Channel Tweed Blazer',           'Chanel fantasy tweed jacket with a multicolour woven weave. Four-pocket front with jewel CC button closures and a silk lining. Quintessential Chanel, crafted in the iconic Rue Cambon ateliers, Paris.',
     85000.00, 'https://www.chanel.com/images/as///f_auto,q_auto:good,dpr_1.1/w_3200/-80383269.jpg', 5.0, 5),

    (3, 'Coach Leather Jacket',           'Coach moto jacket in smooth refined leather. Asymmetric front zip, signature Coach hardware, and a quilted lining for warmth. Rock-meets-luxury, made from Coach''s heritage full-grain leather.',
     42000.00, 'https://coach.scene7.com/is/image/Coach/ct723_blk_a0?$desktopProduct$', 4.7, 8),

    -- ── Accessories (CategoryID = 4) ────────────────────────────
    (4, 'Celine Triomphe Sunglasses',     'Celine Triomphe square sunglasses in ivory acetate. Subtle Triomphe logo at the temples, gradient UV-400 lenses, and an ultra-lightweight frame. Paris-designed, summer-ready, forever chic.',
     40000.00, 'https://image.celine.com/59c24ab04023b67b/original/4S194CPLB-38NO_1_SUM21_W.jpg', 5.0, 15),

    (4, 'Fetch Gold Hoop Earrings',       'Fetch 14k gold-plated hollow hoop earrings. Lightweight construction with an easy push-through clasp and a seamless polished finish. The everyday essential that elevates any outfit, day or night.',
     1700.00, 'https://fetch-mkt.com/cdn/shop/files/bba46a7ae4864968b7a606be8fab4265_600x.progressive_905a0d62-e891-4249-a635-e136727347e1.jpg', 5.0, 60),

    (4, 'Daniel Wellington Classic Watch','Daniel Wellington Classic 36mm in rose gold with a black dial. Interchangeable Italian leather strap, scratch-resistant mineral glass, and a Japanese quartz Miyota movement. Minimalist Scandinavian elegance.',
     13000.00, 'https://us.danielwellington.com/cdn/shop/products/a632d38044c6a937e9dc450156c4f86e26bd4664.png?v=1679995182', 5.0, 25),

    (4, 'Channel Pearl Slippers',         'Chanel velvet slingback flats with interlocking CC and pearl embellishment. Grosgrain ribbon trim, padded leather footbed, and a low stacked heel. From the Metiers d''Art collection, effortlessly iconic.',
     28999.00, 'https://www.chanel.com/images///f_auto,q_auto:good,dpr_1.1/w_3200/-9543237697566.jpg', 5.0, 18),

    (4, 'Fetch Layered Necklace',         'Fetch white freshwater pearl and 14k gold-fill layered necklace. Hand-knotted pearl strand on a delicate gold chain with an adjustable lobster clasp. Dainty, feminine, and made for everyday stacking.',
     2200.00, 'https://fetch-mkt.com/cdn/shop/files/EG-5186_WHITE-PEARL_01_1000x1500_efa66be4-5450-4d5f-9292-657919a9395a_1024x1024.jpg?v=1703274640', 4.8, 45),

    (4, 'Daniel Wellington Petite Watch', 'Daniel Wellington Petite 28mm in rose gold with a clean white dial. Slim case, interchangeable blush leather strap, and a Japanese quartz movement. Understated elegance perfectly sized for a petite wrist.',
     9500.00, 'https://us.danielwellington.com/cdn/shop/files/af1c700f50fae0ac72f151dee5b2336e0485a590.png?v=1729751732', 4.9, 20),

    (4, 'Burberry Check Belt',            'Burberry reversible belt in smooth leather and iconic house check canvas. Pin-buckle closure with an engraved Burberry logo. Two looks in one, the classic that belongs in every wardrobe.',
     18000.00, 'https://assets.burberry.com/is/image/Burberryltd/9E5023C5-A64E-4DE9-86E3-7F9BDFBE1858', 4.7, 16),

    (4, 'Celine Cat-Eye Frames',          'Celine optical cat-eye frames in black acetate. Bold upswept silhouette with subtle Triomphe logo at the temples. Statement eyewear crafted for the confident, fashion-forward woman.',
     35000.00, 'https://image.celine.com/347719c0a3ee7b80/original/4S187CPLB-38NO_1_FALL21.jpg', 4.8, 10),

    -- ── Make Up (CategoryID = 5) ────────────────────────────────
    (5, 'Burberry Signature Perfume',     'Burberry Her Eau de Parfum, a bouquet of wild berries, jasmine, and warm tonka bean. Feminine, modern, and unmistakably British. Presented in the iconic tartan-embossed glass bottle.',
     16000.00, 'https://assets.burberry.com/is/image/Burberryltd/170DBE43-9B00-40B1-A766-F1482E6F263D', 5.0, 45),

    (5, 'Channel No. 5 Eau de Parfum',    'Chanel No. 5 Eau de Parfum, the world''s most iconic fragrance. A floral aldehyde blend of rose, jasmine, ylang-ylang, and sandalwood. First created in 1921 by Ernest Beaux for Gabrielle Chanel.',
     22000.00, 'https://www.chanel.com/images///f_auto,q_auto:good,dpr_1.1/w_1024/-9543237304350.jpg', 5.0, 30),

    (5, 'Celine Lip Gloss Set',           'Celine Vinyle Lip Gloss in a trio of wearable shades. High-shine, non-sticky formula with a plumping effect and nourishing botanical extracts. The Paris-perfected pout in a collectible Celine case.',
     4800.00, 'https://image.celine.com/3a97d0b56dc112bd/original/6LC1C010A-88AD_1_LE-16.jpg', 4.8, 40),

    (5, 'Fetch Glow Highlighter Palette', 'Fetch Super Blend brightening face oil and glow serum. A blend of sea buckthorn, chia seed, and vitamin C that delivers a radiant, dewy finish. Vegan, clean-beauty certified, and clinically tested.',
     1900.00, 'https://fetch-mkt.com/cdn/shop/products/super-blend-w-badges.jpg?v=1585328795', 4.7, 55),

    (5, 'Burberry Fresh Glow Foundation', 'Burberry Ultimate Glow Serum Foundation in a buildable, luminous finish. Hydrating formula enriched with hyaluronic acid and SPF 15. Available in 30 shades, skin-first luxury beauty from Burberry.',
     6500.00, 'https://assets.burberry.com/is/image/Burberryltd/D3BB2731-F916-4277-B568-7B7CF6B65186', 4.9, 35),

    (5, 'Coach Velvet Lipstick Set',      'Coach Dreams Velvet Lipstick Collection, a curated set of velvet-finish shades inspired by Coach''s signature fragrance. Long-wearing conditioning formula with a plush velvet-tip applicator. Wear your dream.',
     3200.00, 'https://coach.scene7.com/is/image/Coach/c5072_l38_a0?$desktopProduct$', 4.6, 38);

    PRINT 'Products seeded successfully (30 products across 5 categories).';
END
GO

-- ============================================================
-- Step 5: Seed Sample Customers
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM Customers)
BEGIN
    INSERT INTO Customers (FirstName, LastName, Email, Phone, Address) VALUES
    ('Kanakam', 'Bhuvanateja', 'kanakam.bhuvanateja@insightsoftware.com', '9999999999', 'Hyderabad, India'),
    ('Test',    'Customer',    'test.customer@example.com',               '8888888888', 'Mumbai, India');
    PRINT 'Sample customers seeded successfully.';
END
GO

-- ============================================================
-- Step 6: Verification Queries
-- ============================================================

PRINT '--- Verification: Counts ---';
SELECT 'Categories' AS TableName, COUNT(*) AS RecordCount FROM Categories
UNION ALL
SELECT 'Products',  COUNT(*) FROM Products
UNION ALL
SELECT 'Customers', COUNT(*) FROM Customers
UNION ALL
SELECT 'Orders',    COUNT(*) FROM Orders;

PRINT '--- Products with Category Names ---';
SELECT
    p.ProductID,
    c.CategoryName,
    p.ProductName,
    p.Price,
    p.StockQty,
    p.Rating
FROM Products p
JOIN Categories c ON p.CategoryID = c.CategoryID
ORDER BY c.CategoryName, p.Price;

PRINT '--- Setup Complete! WebsiteDB is ready to use. ---';
GO
