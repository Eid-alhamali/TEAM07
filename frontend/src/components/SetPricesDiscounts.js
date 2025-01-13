import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SetPricesDiscounts.css"; // Ensure this CSS file exists for styling
import backIcon from '../assets/images/icons/back.png'; 

const SetPricesDiscounts = () => {
  const [variants, setVariants] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/product-variants", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const fetchedVariants = Array.isArray(response.data)
          ? response.data
          : response.data.variants || [];

        const variantsWithDiscounts = await Promise.all(
          fetchedVariants.map(async (variant) => {
            try {
              const discountResponse = await axios.get(
                `http://localhost:5001/api/product/variant/${variant.variant_id}/discount`
              );
              const discountData = discountResponse.data;
              const basePrice = parseFloat(variant.price);
              const discountValue = discountData.discount?.value || 0;

              return {
                ...variant,
                discount: discountValue,
                discountedPrice: parseFloat((basePrice * (1 - discountValue / 100)).toFixed(2)),
                basePrice: basePrice,
                initialBasePrice: basePrice,
                currentDiscount: discountValue, // Store the current discount separately
              };
            } catch (error) {
              console.error("Error fetching discount for variant:", variant.variant_id, error);
              return {
                ...variant,
                discount: 0,
                discountedPrice: parseFloat(variant.price),
                basePrice: parseFloat(variant.price),
                initialBasePrice: parseFloat(variant.price),
                currentDiscount: 0, // Default current discount to 0 on error
              };
            }
          })
        );

        setVariants(variantsWithDiscounts);
      } catch (error) {
        console.error("Error fetching product variants:", error);
        alert("Failed to fetch product variants.");
      }
    };
    fetchVariants();
  }, []);

  const handleInputChange = (index, field, value) => {
    const updatedVariants = [...variants];
    const variant = updatedVariants[index];

    if (field === "discount") {
      const discount = parseFloat(value) || 0;
      if (discount < 0 || discount > 100) {
        console.warn("Invalid discount value:", discount);
        return;
      }
      variant.discount = discount;
      variant.discountedPrice = parseFloat(
        (variant.initialBasePrice * (1 - discount / 100)).toFixed(2)
      );
    } else if (field === "basePrice") {
      const newBasePrice = parseFloat(value) || 0;
      variant.basePrice = newBasePrice;
      variant.initialBasePrice = newBasePrice;
      variant.discountedPrice = parseFloat(
        (newBasePrice * (1 - variant.discount / 100)).toFixed(2)
      );
    }

    setVariants(updatedVariants);
  };

  const handleSave = async () => {
    try {
      const updatedVariants = variants.map((variant) => ({
        variant_id: variant.variant_id,
        price: variant.basePrice,
        discount: variant.discount || 0,
      }));

      const response = await axios.put(
        "http://localhost:5001/api/product-variants/update",
        { variants: updatedVariants },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const changedDiscounts = response.data.changedDiscounts || [];

      if (changedDiscounts.length === 0) {
        alert("No discount changes.");
        return; // Stop further execution if no changes
      }
      const notificationPromises = changedDiscounts.map(async (variantId) => {
        const variant = updatedVariants.find((v) => v.variant_id === variantId);
        try {
          await axios.post(
            "http://localhost:5001/api/discounts/notify-discount",
            {
              variantId: variantId,
              discountValue: variant.discount,
            },
            {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }
          );
        } catch (error) {
          console.error(`Failed to notify users for variant ID ${variantId}:`, error);
        }
      });

      await Promise.all(notificationPromises);

      if (changedDiscounts.length !== 0) {
        alert("Prices, discounts, and notifications updated successfully!");

        return; // Stop further execution if no changes
      }
    } catch (error) {
      console.error("Error updating prices and discounts:", error);
      alert("Failed to update prices and discounts.");
    }
  };

  return (
    <div className="set-prices-container">
      <div
        className="orders-page__back-btn"
        onClick={() => navigate("/admin/sales_management")}
      >
        <img
          src={backIcon}
          alt="Back"
          className="orders-page__back-icon"
        />
        <span>Go Back</span>
      </div>

      <div className="set-prices-title-container">
        <h1 className="set-prices-title">Set Prices and Discounts</h1>
        <p className="set-prices-description">Edit the variant prices and discount percentages.</p>
      </div>
      
      <div className="product-table-container">
        {variants.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Variant ID</th>
                <th>Product Name</th>
                <th>Weight (g)</th>
                <th>Current Discount (%)</th>
                <th>Original Price</th>
                <th>Update Discount (%)</th>
                <th>Discounted Price</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant, index) => (
                <tr key={variant.variant_id}>
                  <td>{variant.variant_id}</td>
                  <td>{variant.name}</td>
                  <td>{variant.weight_grams}</td>
                  <td>{variant.currentDiscount}</td>
                  <td>
                    <input
                      type="number"
                      value={variant.basePrice}
                      onChange={(e) =>
                        handleInputChange(index, "basePrice", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={variant.discount}
                      onChange={(e) =>
                        handleInputChange(index, "discount", e.target.value)
                      }
                    />
                  </td>
                  <td style={{ color: "red", fontWeight: "bold" }}>
                    {variant.discountedPrice.toFixed(2)} TL
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No product variants available.</p>
        )}
      </div>

      <button className="save-button" onClick={handleSave}>
        Save Changes
      </button>
    </div>
  );
};

export default SetPricesDiscounts;