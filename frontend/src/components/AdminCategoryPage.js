import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminCategoryPage.css";

const AdminCategoryPage = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: "", description: "" });
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get("http://localhost:5001/api/categories");
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleAddCategory = async () => {
        try {
            await axios.post("http://localhost:5001/api/categories/add", newCategory);
            fetchCategories();
            setNewCategory({ name: "", description: "" });
        } catch (error) {
            console.error("Error adding category:", error);
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            await axios.delete(`http://localhost:5001/api/categories/${id}/delete`);
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    return (
        <div className="admin-category-container">
            <button className="go-back-button-category" onClick={() => navigate("/admin/product_management")}>
                Go Back
            </button>
            <h1>Category Management</h1>

            <div className="add-category-form">
                <input
                    type="text"
                    placeholder="Category Name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                />
                <button onClick={handleAddCategory}>Add Category</button>
            </div>

            <h2>Existing Categories</h2>
            <ul className="category-list">
                {categories.map((category) => (
                    <li key={category.category_id}>
                        <div>
                            <strong>{category.name}</strong> - {category.description || "No description"}
                        </div>
                        <button onClick={() => handleDeleteCategory(category.category_id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminCategoryPage;