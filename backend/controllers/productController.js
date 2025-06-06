// // controllers/productController.js
// import Product from "../models/Product.js"

// class ProductController {
//   // Helper method to parse multilingual fields
//   static parseMultilingualFields(body) {
//     const name = {}
//     const description = {}

//     console.log("=== Parsing Multilingual Fields ===")
//     console.log("Request body keys:", Object.keys(body))

//     Object.keys(body).forEach((key) => {
//       if (key.startsWith("name[")) {
//         const lang = key.match(/\[(.*?)\]/)[1]
//         if (body[key] && body[key].trim()) {
//           name[lang] = body[key].trim()
//           console.log(`Found name[${lang}]:`, body[key].trim())
//         }
//       }
//       if (key.startsWith("description[")) {
//         const lang = key.match(/\[(.*?)\]/)[1]
//         if (body[key] && body[key].trim()) {
//           description[lang] = body[key].trim()
//           console.log(`Found description[${lang}]:`, body[key].trim())
//         }
//       }
//     })

//     console.log("Parsed name:", name)
//     console.log("Parsed description:", description)

//     return { name, description }
//   }

//   // Helper method to validate required fields
//   static validateRequiredFields(body) {
//     const errors = []

//     console.log("=== Validating Required Fields ===")
//     console.log("name[en]:", body["name[en]"])
//     console.log("description[en]:", body["description[en]"])
//     console.log("price:", body.price)

//     // Check name[en]
//     if (!body["name[en]"]) {
//       errors.push("Product name (English) is required")
//       console.log("ERROR: name[en] is missing")
//     } else if (!body["name[en]"].trim()) {
//       errors.push("Product name cannot be empty")
//       console.log("ERROR: name[en] is empty")
//     }

//     // Check description[en]
//     if (!body["description[en]"]) {
//       errors.push("Product description (English) is required")
//       console.log("ERROR: description[en] is missing")
//     } else if (!body["description[en]"].trim()) {
//       errors.push("Product description cannot be empty")
//       console.log("ERROR: description[en] is empty")
//     }

//     // Check price
//     if (!body.price) {
//       errors.push("Product price is required")
//       console.log("ERROR: price is missing")
//     } else if (isNaN(body.price) || Number.parseFloat(body.price) <= 0) {
//       errors.push("Product price must be a positive number")
//       console.log("ERROR: price is invalid:", body.price)
//     }

//     console.log("Validation errors:", errors)
//     return errors
//   }

//   // Helper method to parse specs
//   static parseSpecs(specs) {
//     try {
//       if (!specs) return []
//       const parsed = JSON.parse(specs)
//       return parsed.filter((spec) => spec.label && spec.label.en && spec.value && spec.value.en)
//     } catch (err) {
//       console.error("Specs parsing error:", err)
//       return []
//     }
//   }

//   // Get all products
//   static async getAllProducts(req, res) {
//     try {
//       console.log("=== Getting All Products ===")
//       const products = await Product.find().sort({ createdAt: -1 })
//       console.log(`Found ${products.length} products`)
//       res.json(products)
//     } catch (error) {
//       console.error("Get products error:", error)
//       res.status(500).json({
//         message: "Failed to fetch products",
//         error: error.message,
//       })
//     }
//   }

//   // Create new product
//   static async createProduct(req, res) {
//     try {
//       console.log("=== Creating New Product ===")
//       console.log("Request body:", req.body)
//       console.log("Request file:", req.file ? req.file.filename : "No file")

//       // Validate required fields first
//       const validationErrors = ProductController.validateRequiredFields(req.body)
//       if (validationErrors.length > 0) {
//         console.log("Validation failed:", validationErrors)
//         return res.status(400).json({
//           message: validationErrors.join(", "),
//           error: "Validation failed",
//         })
//       }

//       const { price, specs } = req.body

//       // Parse multilingual fields
//       const { name, description } = ProductController.parseMultilingualFields(req.body)

//       // Validate parsed fields
//       if (!name.en || !description.en) {
//         console.log("ERROR: Parsed fields are missing")
//         return res.status(400).json({
//           message: "Failed to parse product name or description",
//           error: "Parsing failed",
//         })
//       }

//       // Set image URL
//       let imageUrl = ""
//       if (req.file) {
//         imageUrl = `/uploads/${req.file.filename}`
//         console.log("Image uploaded:", imageUrl)
//       }

//       // Parse specs
//       const parsedSpecs = ProductController.parseSpecs(specs)
//       console.log("Parsed specs:", parsedSpecs)

//       // Create product data
//       const productData = {
//         name,
//         description,
//         price: Number.parseFloat(price),
//         imageUrl,
//         specs: parsedSpecs,
//       }

//       console.log("=== Final Product Data ===")
//       console.log(JSON.stringify(productData, null, 2))

//       // Create and save product
//       const newProduct = new Product(productData)

//       // Validate before saving
//       const validationError = newProduct.validateSync()
//       if (validationError) {
//         console.error("Mongoose validation error:", validationError)
//         const errorMessages = Object.values(validationError.errors).map((e) => e.message)
//         return res.status(400).json({
//           message: errorMessages.join(", "),
//           error: "Mongoose validation failed",
//         })
//       }

//       await newProduct.save()
//       console.log("✅ Product saved successfully:", newProduct._id)

//       res.status(201).json(newProduct)
//     } catch (error) {
//       console.error("=== Product Creation Failed ===")
//       console.error("Error message:", error.message)
//       console.error("Error stack:", error.stack)

//       if (error.name === "ValidationError") {
//         const errorMessages = Object.values(error.errors).map((e) => e.message)
//         return res.status(400).json({
//           message: errorMessages.join(", "),
//           error: "Validation failed",
//         })
//       }

//       if (error.code === 11000) {
//         return res.status(400).json({
//           message: "Duplicate product",
//           error: "Product already exists",
//         })
//       }

//       res.status(500).json({
//         message: "Product creation failed",
//         error: error.message,
//       })
//     }
//   }

//   // Update product
//   static async updateProduct(req, res) {
//     try {
//       console.log("=== Updating Product ===")
//       console.log("Product ID:", req.params.id)
//       console.log("Request body:", req.body)
//       console.log("Request file:", req.file ? req.file.filename : "No file")

//       const { price, specs } = req.body

//       // Parse multilingual fields
//       const { name, description } = ProductController.parseMultilingualFields(req.body)

//       const updateData = {
//         name,
//         description,
//         price: Number.parseFloat(price),
//       }

//       // Parse specs
//       if (specs) {
//         updateData.specs = ProductController.parseSpecs(specs)
//       }

//       // Update image if new file uploaded
//       if (req.file) {
//         updateData.imageUrl = `/uploads/${req.file.filename}`
//       }

//       console.log("Update data:", updateData)

//       const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, {
//         new: true,
//         runValidators: true,
//       })

//       if (!updatedProduct) {
//         return res.status(404).json({ message: "Product not found" })
//       }

//       console.log("✅ Product updated successfully:", updatedProduct._id)
//       res.json(updatedProduct)
//     } catch (error) {
//       console.error("=== Product Update Failed ===")
//       console.error("Error message:", error.message)

//       if (error.name === "ValidationError") {
//         const errorMessages = Object.values(error.errors).map((e) => e.message)
//         return res.status(400).json({
//           message: errorMessages.join(", "),
//           error: "Validation failed",
//         })
//       }

//       if (error.name === "CastError") {
//         return res.status(400).json({
//           message: "Invalid product ID",
//           error: "Invalid ID format",
//         })
//       }

//       res.status(500).json({
//         message: "Failed to update product",
//         error: error.message,
//       })
//     }
//   }

//   // Delete product
//   static async deleteProduct(req, res) {
//     try {
//       console.log("=== Deleting Product ===")
//       console.log("Product ID:", req.params.id)

//       const deletedProduct = await Product.findByIdAndDelete(req.params.id)

//       if (!deletedProduct) {
//         return res.status(404).json({ message: "Product not found" })
//       }

//       console.log("✅ Product deleted successfully:", req.params.id)
//       res.json({ success: true, message: "Product deleted successfully" })
//     } catch (error) {
//       console.error("Delete product error:", error)

//       if (error.name === "CastError") {
//         return res.status(400).json({
//           message: "Invalid product ID",
//           error: "Invalid ID format",
//         })
//       }

//       res.status(500).json({
//         message: "Failed to delete product",
//         error: error.message,
//       })
//     }
//   }
// }

// export default ProductController



// controllers/productController.js
import Product from "../models/Product.js"

class ProductController {
  // Helper method to parse multilingual fields - SIMPLIFIED
  static parseMultilingualFields(body) {
    console.log("=== Parsing Multilingual Fields (Simplified) ===")
    console.log("Request body:", body)

    const name = {
      en: body.nameEn || "",
    }

    const description = {
      en: body.descriptionEn || "",
    }

    console.log("Parsed name:", name)
    console.log("Parsed description:", description)

    return { name, description }
  }

  // Helper method to validate required fields - SIMPLIFIED
  static validateRequiredFields(body) {
    const errors = []

    console.log("=== Validating Required Fields (Simplified) ===")
    console.log("Request body:", body)
    console.log("Request body keys:", Object.keys(body))

    // Check nameEn
    if (!body.nameEn) {
      errors.push("Product name is required - nameEn field missing")
      console.log("ERROR: nameEn field is missing from request")
    } else if (typeof body.nameEn !== "string") {
      errors.push("Product name must be a string")
      console.log("ERROR: nameEn is not a string:", typeof body.nameEn)
    } else if (!body.nameEn.trim()) {
      errors.push("Product name cannot be empty")
      console.log("ERROR: nameEn is empty after trim")
    } else {
      console.log("✅ nameEn validation passed:", body.nameEn)
    }

    // Check descriptionEn
    if (!body.descriptionEn) {
      errors.push("Product description is required - descriptionEn field missing")
      console.log("ERROR: descriptionEn field is missing from request")
    } else if (typeof body.descriptionEn !== "string") {
      errors.push("Product description must be a string")
      console.log("ERROR: descriptionEn is not a string:", typeof body.descriptionEn)
    } else if (!body.descriptionEn.trim()) {
      errors.push("Product description cannot be empty")
      console.log("ERROR: descriptionEn is empty after trim")
    } else {
      console.log("✅ descriptionEn validation passed:", body.descriptionEn)
    }

    // Check price
    if (!body.price) {
      errors.push("Product price is required")
      console.log("ERROR: price field is missing")
    } else if (isNaN(body.price) || Number.parseFloat(body.price) <= 0) {
      errors.push("Product price must be a positive number")
      console.log("ERROR: price is invalid:", body.price)
    } else {
      console.log("✅ price validation passed:", body.price)
    }

    console.log("Validation result - errors:", errors)
    return errors
  }

  // Helper method to parse specs
  static parseSpecs(specs) {
    try {
      if (!specs) return []
      const parsed = JSON.parse(specs)
      return parsed.filter((spec) => spec.label && spec.label.en && spec.value && spec.value.en)
    } catch (err) {
      console.error("Specs parsing error:", err)
      return []
    }
  }

  // Get all products
  static async getAllProducts(req, res) {
    try {
      console.log("=== Getting All Products ===")
      const products = await Product.find().sort({ createdAt: -1 })
      console.log(`Found ${products.length} products`)
      res.json(products)
    } catch (error) {
      console.error("Get products error:", error)
      res.status(500).json({
        message: "Failed to fetch products",
        error: error.message,
      })
    }
  }

  // Create new product
  static async createProduct(req, res) {
    try {
      console.log("=== Creating New Product ===")
      console.log("Request body:", req.body)
      console.log("Request file:", req.file ? req.file.filename : "No file")

      // Validate required fields first
      const validationErrors = ProductController.validateRequiredFields(req.body)
      if (validationErrors.length > 0) {
        console.log("Validation failed:", validationErrors)
        return res.status(400).json({
          message: validationErrors.join(", "),
          error: "Validation failed",
        })
      }

      const { price, specs } = req.body

      // Parse multilingual fields
      const { name, description } = ProductController.parseMultilingualFields(req.body)

      // Validate parsed fields
      if (!name.en || !description.en) {
        console.log("ERROR: Parsed fields are missing")
        return res.status(400).json({
          message: "Failed to parse product name or description",
          error: "Parsing failed",
        })
      }

      // Set image URL
      let imageUrl = ""
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`
        console.log("Image uploaded:", imageUrl)
      }

      // Parse specs
      const parsedSpecs = ProductController.parseSpecs(specs)
      console.log("Parsed specs:", parsedSpecs)

      // Create product data
      const productData = {
        name,
        description,
        price: Number.parseFloat(price),
        imageUrl,
        specs: parsedSpecs,
      }

      console.log("=== Final Product Data ===")
      console.log(JSON.stringify(productData, null, 2))

      // Create and save product
      const newProduct = new Product(productData)

      // Validate before saving
      const validationError = newProduct.validateSync()
      if (validationError) {
        console.error("Mongoose validation error:", validationError)
        const errorMessages = Object.values(validationError.errors).map((e) => e.message)
        return res.status(400).json({
          message: errorMessages.join(", "),
          error: "Mongoose validation failed",
        })
      }

      await newProduct.save()
      console.log("✅ Product saved successfully:", newProduct._id)

      res.status(201).json(newProduct)
    } catch (error) {
      console.error("=== Product Creation Failed ===")
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)

      if (error.name === "ValidationError") {
        const errorMessages = Object.values(error.errors).map((e) => e.message)
        return res.status(400).json({
          message: errorMessages.join(", "),
          error: "Validation failed",
        })
      }

      if (error.code === 11000) {
        return res.status(400).json({
          message: "Duplicate product",
          error: "Product already exists",
        })
      }

      res.status(500).json({
        message: "Product creation failed",
        error: error.message,
      })
    }
  }

  // Update product
  static async updateProduct(req, res) {
    try {
      console.log("=== Updating Product ===")
      console.log("Product ID:", req.params.id)
      console.log("Request body:", req.body)
      console.log("Request file:", req.file ? req.file.filename : "No file")

      const { price, specs } = req.body

      // Parse multilingual fields
      const { name, description } = ProductController.parseMultilingualFields(req.body)

      const updateData = {
        name,
        description,
        price: Number.parseFloat(price),
      }

      // Parse specs
      if (specs) {
        updateData.specs = ProductController.parseSpecs(specs)
      }

      // Update image if new file uploaded
      if (req.file) {
        updateData.imageUrl = `/uploads/${req.file.filename}`
      }

      console.log("Update data:", updateData)

      const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      })

      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" })
      }

      console.log("✅ Product updated successfully:", updatedProduct._id)
      res.json(updatedProduct)
    } catch (error) {
      console.error("=== Product Update Failed ===")
      console.error("Error message:", error.message)

      if (error.name === "ValidationError") {
        const errorMessages = Object.values(error.errors).map((e) => e.message)
        return res.status(400).json({
          message: errorMessages.join(", "),
          error: "Validation failed",
        })
      }

      if (error.name === "CastError") {
        return res.status(400).json({
          message: "Invalid product ID",
          error: "Invalid ID format",
        })
      }

      res.status(500).json({
        message: "Failed to update product",
        error: error.message,
      })
    }
  }

  // Delete product
  static async deleteProduct(req, res) {
    try {
      console.log("=== Deleting Product ===")
      console.log("Product ID:", req.params.id)

      const deletedProduct = await Product.findByIdAndDelete(req.params.id)

      if (!deletedProduct) {
        return res.status(404).json({ message: "Product not found" })
      }

      console.log("✅ Product deleted successfully:", req.params.id)
      res.json({ success: true, message: "Product deleted successfully" })
    } catch (error) {
      console.error("Delete product error:", error)

      if (error.name === "CastError") {
        return res.status(400).json({
          message: "Invalid product ID",
          error: "Invalid ID format",
        })
      }

      res.status(500).json({
        message: "Failed to delete product",
        error: error.message,
      })
    }
  }
}

export default ProductController
