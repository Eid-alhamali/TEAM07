import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddProductPage.css";

const AddProductPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]); // Categories state


    const [product, setProduct] = useState({
        name: "",
        origin: "",
        roast_level: "Medium",
        bean_type: "Arabica",
        grind_type: "Whole Bean",
        flavor_profile: "",
        processing_method: "Natural",
        caffeine_content: "High",
        category_id: "",
        description: "",
        warranty_status: false,
        distributor_info: "",
    });

    const [variants, setVariants] = useState([{ weight_grams: "", price: "", stock: "", sku: "" }]);
    const [images, setImages] = useState([{ image_url: "", alt_text: "" }]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("http://localhost:5001/api/categories");
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
                alert("Failed to load categories.");
            }
        };
        fetchCategories();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleVariantChange = (index, e) => {
        const { name, value } = e.target;
        const updatedVariants = [...variants];
        const parsedValue = parseFloat(value);

        if ((name === "price" || name === "stock" || name === "weight_grams") && parsedValue <= 0) {
            alert(`${name.replace("_", " ")} must be greater than 0.`);
            return;
        }
        updatedVariants[index][name] = value;
        setVariants(updatedVariants);
    };

    const handleImageChange = (index, e) => {
        const { name, value } = e.target;
        const updatedImages = [...images];
        updatedImages[index][name] = value;
        setImages(updatedImages);
    };

    const addVariant = () => {
        setVariants((prev) => [...prev, { weight_grams: "", price: "", stock: "", sku: "" }]);
    };

    const addImage = () => {
        setImages((prev) => [...prev, { image_url: "", alt_text: "" }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            product: {
                ...product,
                category_id: product.category_id ? parseInt(product.category_id, 10) : null,
            },
            variants,
            images,
        };

        console.log("Payload being sent:", payload);

        try {
            const response = await axios.post("http://localhost:5001/api/products/create", payload);
            console.log("Server Response:", response);
            if (response.status === 201) {
                alert("Product added successfully!");
                navigate("/admin/view_products");
            } else {
                alert(`Failed to add product. Status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error adding product:", error);
            alert(
                error.response?.data?.error ||
                    `Failed to add product. Error: ${error.message}`
            );
        }
    };

    return (
        <div className="add-product-container">
            <button
                className="go-back-button"
                onClick={() => navigate("/admin/view_products")}
            >
                Go Back
            </button>

            <h1>Add New Product</h1>
            <form className="add-product-form" onSubmit={handleSubmit}>
                <h2>Product Details</h2>
                <div className="form-group">
                    <label>Product Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Origin:</label>
                    <input
                        type="text"
                        name="origin"
                        value={product.origin}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Roast Level:</label>
                    <select name="roast_level" value={product.roast_level} onChange={handleInputChange}>
                        <option value="Light">Light</option>
                        <option value="Medium">Medium</option>
                        <option value="Dark">Dark</option>
                        <option value="French">French</option>
                        <option value="Espresso">Espresso</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Bean Type:</label>
                    <select name="bean_type" value={product.bean_type} onChange={handleInputChange}>
                        <option value="Arabica">Arabica</option>
                        <option value="Robusta">Robusta</option>
                        <option value="Liberica">Liberica</option>
                        <option value="Blend">Blend</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Grind Type:</label>
                    <select name="grind_type" value={product.grind_type} onChange={handleInputChange}>
                        <option value="Whole Bean">Whole Bean</option>
                        <option value="Ground">Ground</option>
                        <option value="Pods">Pods</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Flavor Profile:</label>
                    <input
                        type="text"
                        name="flavor_profile"
                        value={product.flavor_profile}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Processing Method:</label>
                    <select name="processing_method" value={product.processing_method} onChange={handleInputChange}>
                        <option value="Washed">Washed</option>
                        <option value="Natural">Natural</option>
                        <option value="Honey-processed">Honey-processed</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Caffeine Content:</label>
                    <select name="caffeine_content" value={product.caffeine_content} onChange={handleInputChange}>
                        <option value="High">High</option>
                        <option value="Decaf">Decaf</option>
                        <option value="Half-Caf">Half-Caf</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Category:</label>
                    <select name="category_id" value={product.category_id} onChange={handleInputChange} required>
                        <option value="">-- Select Category --</option>
                        {categories.map((category) => (
                            <option key={category.category_id} value={category.category_id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Description:</label>
                    <textarea
                        name="description"
                        value={product.description}
                        onChange={handleInputChange}
                    ></textarea>
                </div>
                <div className="form-group">
                    <label>Warranty Status:</label>
                    <input
                        type="checkbox"
                        name="warranty_status"
                        checked={product.warranty_status}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Distributor Info:</label>
                    <textarea
                        name="distributor_info"
                        value={product.distributor_info}
                        onChange={handleInputChange}
                    ></textarea>
                </div>

                <h2>Variants</h2>
                {variants.map((variant, index) => (
                    <div key={index} className="variant-card">
                        <h3>Variant {index + 1}</h3>
                        <div className="variant-input-group">
                            <label>Weight (grams):</label>
                            <input
                                type="number"
                                name="weight_grams"
                                value={variant.weight_grams}
                                onChange={(e) => handleVariantChange(index, e)}
                                required
                            />
                        </div>
                        <div className="variant-input-group">
                            <label>Price:</label>
                            <input
                                type="number"
                                name="price"
                                value={variant.price}
                                onChange={(e) => handleVariantChange(index, e)}
                                required
                            />
                        </div>
                        <div className="variant-input-group">
                            <label>Stock:</label>
                            <input
                                type="number"
                                name="stock"
                                value={variant.stock}
                                onChange={(e) => handleVariantChange(index, e)}
                                required
                            />
                        </div>
                        <div className="variant-input-group">
                            <label>SKU:</label>
                            <input
                                type="text"
                                name="sku"
                                value={variant.sku}
                                onChange={(e) => handleVariantChange(index, e)}
                                required
                            />
                        </div>
                    </div>
                ))}
                <button type="button" className="add-variant-button" onClick={addVariant}>
                    Add Another Variant
                </button>

                <h2>Images</h2>
                {images.map((image, index) => (
                    <div key={index} className="image-card">
                        <h3>Image {index + 1}</h3>
                        <div className="image-input-group">
                            <label>Image URL:</label>
                            <input
                                type="url"
                                name="image_url"
                                value={image.image_url}
                                onChange={(e) => handleImageChange(index, e)}
                            />
                        </div>
                        <div className="image-input-group">
                            <label>Alt Text:</label>
                            <input
                                type="text"
                                name="alt_text"
                                value={image.alt_text}
                                onChange={(e) => handleImageChange(index, e)}
                            />
                        </div>
                    </div>
                ))}
                <button type="button" className="add-image-button" onClick={addImage}>
                    Add Another Image
                </button>


                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default AddProductPage;