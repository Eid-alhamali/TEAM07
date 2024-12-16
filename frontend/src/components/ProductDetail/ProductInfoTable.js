import PropTypes from "prop-types";
import "./ProductInfoTable.css";

const ProductInfoTable = ({ product }) => {
    if (!product) {
        return <div className="no-product">Product information not available</div>;
    }

    return (
        <div className="product-info-section">
            <h2>Product Information</h2>
            <table className="product-info-table">
                <tbody>
                    <tr>
                        <td><strong>Model:</strong></td>
                        <td>{product.model || "N/A"}</td>
                    </tr>
                    <tr>
                        <td><strong>Serial Number:</strong></td>
                        <td>{product.serial_number || "N/A"}</td>
                    </tr>
                    <tr>
                        <td><strong>Origin:</strong></td>
                        <td>{product.origin || "N/A"}</td>
                    </tr>
                    <tr>
                        <td><strong>Roast Level:</strong></td>
                        <td>{product.roast_level || "N/A"}</td>
                    </tr>
                    <tr>
                        <td><strong>Bean Type:</strong></td>
                        <td>{product.bean_type || "N/A"}</td>
                    </tr>
                    <tr>
                        <td><strong>Flavor Profile:</strong></td>
                        <td>{product.flavor_profile || "N/A"}</td>
                    </tr>
                    <tr>
                        <td><strong>Processing Method:</strong></td>
                        <td>{product.processing_method || "N/A"}</td>
                    </tr>
                    <tr>
                        <td><strong>Warranty Status:</strong></td>
                        <td>{product.warranty_status ? "Yes" : "No"}</td>
                    </tr>
                    <tr>
                        <td><strong>Distributor Information:</strong></td>
                        <td>{product.distributor_info || "N/A"}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

ProductInfoTable.propTypes = {
    product: PropTypes.shape({
        model: PropTypes.string,
        serial_number: PropTypes.string,
        origin: PropTypes.string,
        roast_level: PropTypes.string,
        bean_type: PropTypes.string,
        flavor_profile: PropTypes.string,
        processing_method: PropTypes.string,
        warranty_status: PropTypes.bool,
        distributor_info: PropTypes.string,
    }).isRequired,
};

export default ProductInfoTable;
