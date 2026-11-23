CREATE TYPE "UserRole" AS ENUM ('BUYER', 'ARTISAN', 'ADMIN');
CREATE TYPE "ProductCategory" AS ENUM ('CERAMICA', 'MADEIRA', 'TEXTIL', 'JOALHERIA', 'OUTROS');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'SHIPPED', 'COMPLETED', 'CANCELLED');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "phone" TEXT,
  "cpfHash" TEXT,
  "cpfLast4" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'BUYER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Artisan" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "city" TEXT NOT NULL DEFAULT '',
  "state" TEXT NOT NULL DEFAULT '',
  "phone" TEXT NOT NULL DEFAULT '',
  "bio" TEXT NOT NULL DEFAULT '',
  "avatarImage" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Artisan_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Artisan_userId_key" ON "Artisan"("userId");

CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" "ProductCategory" NOT NULL,
  "technique" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "stock" INTEGER NOT NULL,
  "weightKg" DOUBLE PRECISION NOT NULL,
  "lengthCm" DOUBLE PRECISION NOT NULL,
  "widthCm" DOUBLE PRECISION NOT NULL,
  "heightCm" DOUBLE PRECISION NOT NULL,
  "mainImage" TEXT NOT NULL,
  "additionalImages" TEXT[],
  "shippingEstimated" BOOLEAN NOT NULL DEFAULT false,
  "artisanId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Product_category_idx" ON "Product"("category");
CREATE INDEX "Product_artisanId_idx" ON "Product"("artisanId");

CREATE TABLE "CartItem" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CartItem_userId_productId_key" ON "CartItem"("userId", "productId");

CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "number" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "subtotal" DECIMAL(10,2) NOT NULL,
  "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "shipping" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "shippingName" TEXT,
  "deliveryTime" TEXT,
  "paymentBrand" TEXT NOT NULL,
  "paymentLast4" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Order_number_key" ON "Order"("number");

CREATE TABLE "OrderItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "quantity" INTEGER NOT NULL,
  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Review" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Review_userId_productId_key" ON "Review"("userId", "productId");

ALTER TABLE "Artisan" ADD CONSTRAINT "Artisan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "Artisan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
