// src/components/ProfilePage.js
import  { useState } from 'react';
import './ProfilePage.css';

const ProfilePage = () => {
  // Dummy profile data
//   const [profile, setProfile] = useState({
//     picture: '/profile.png',
//     role: 'Mustafa Topcu',
//     email: 'customer@example.com',
//     phone: '+1 234 567 890',
//     taxId: '2',
//   });

  const profile = ({
    picture: '/profile_black.png',
    role: 'Mustafa Topcu',
    email: 'customer@example.com',
    phone: '5453943602',
    taxId: '2',
  });

  // Dummy address data
  const [addresses, setAddresses] = useState([
    {
      address_id: 1,
      address_name: 'Home',
      address_line: '123 Main St',
      city: 'New York',
      phone_number: '+1 234 567 890',
      postal_code: '10001',
      country: 'USA',
    },
    {
      address_id: 2,
      address_name: 'Office',
      address_line: '456 Corporate Blvd',
      city: 'Los Angeles',
      phone_number: '+1 987 654 321',
      postal_code: '90001',
      country: 'USA',
    },
  ]);
  
  // State to manage which address is expanded
  const [expandedAddressId, setExpandedAddressId] = useState(null);

  // State to manage edited address data
  const [editedAddress, setEditedAddress] = useState({});

  // State to manage if any changes have been made to the address
  const [isModified, setIsModified] = useState(false);

  // State to manage new address form visibility
  const [isCreating, setIsCreating] = useState(false);

  // State to manage new address data
  const [newAddress, setNewAddress] = useState({
    address_name: '',
    address_line: '',
    city: '',
    phone_number: '',
    postal_code: '',
    country: '',
  });

  // Handle expanding/collapsing an address
  const toggleExpand = (address_id) => {
    if (expandedAddressId === address_id) {
      setExpandedAddressId(null);
      setIsModified(false);
    } else {
      setExpandedAddressId(address_id);
      const addressToEdit = addresses.find((addr) => addr.address_id === address_id);
      setEditedAddress({ ...addressToEdit });
      setIsModified(false);
    }
  };

  // Handle input changes for editing an address
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsModified(true);
  };

  // Save changes to an address
  const handleSaveChanges = (address_id) => {
    setAddresses((prevAddresses) =>
      prevAddresses.map((addr) =>
        addr.address_id === address_id ? { ...editedAddress } : addr
      )
    );
    setExpandedAddressId(null);
    setIsModified(false);
  };

  // Delete an address
  const handleDeleteAddress = (address_id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      setAddresses((prevAddresses) => prevAddresses.filter((addr) => addr.address_id !== address_id));
      // If the deleted address was expanded, collapse it
      if (expandedAddressId === address_id) {
        setExpandedAddressId(null);
        setIsModified(false);
      }
    }
  };

  // Handle input changes for new address
  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add a new address
  const handleAddAddress = (e) => {
    e.preventDefault();
    const isValid = Object.values(newAddress).every((field) => field.trim() !== '');
    if (!isValid) {
      alert('Please fill in all fields.');
      return;
    }
    const newAddressEntry = {
      address_id: Date.now(), // Simple unique ID generation
      ...newAddress,
    };
    setAddresses((prevAddresses) => [...prevAddresses, newAddressEntry]);
    setNewAddress({
      address_name: '',
      address_line: '',
      city: '',
      phone_number: '',
      postal_code: '',
      country: '',
    });
    setIsCreating(false);
  };

  return (
    <div className="profilepart_container">
      {/* Profile Section */}
      <div className="profilepart_profileSection">
        <img
          src={profile.picture}
          alt="Profile"
          className="profilepart_profilePicture"
        />
        <h2 className="profilepart_role">{profile.role}</h2>
        <div className="profilepart_contactInfo">
          <span>{profile.email}</span>
          <span>|</span>
          <span>{profile.phone}</span>
          <span>|</span>
          <span>tax id: {profile.taxId}</span>
        </div>
      </div>

      {/* Address Section */}
      <div className="profilepart_addressSection">
        <h3 className="profilepart_sectionTitle">Addresses</h3>
        <div className="profilepart_addressList">
          {addresses.map((address) => (
            <div key={address.address_id} className="profilepart_addressItem">
              {/* Address Header */}
              <div
                className="profilepart_addressHeader"
                onClick={() => toggleExpand(address.address_id)}
              >
                <h4>{address.address_name}</h4>
                <span>{expandedAddressId === address.address_id ? '-' : '+'}</span>
              </div>

              {/* Address Details (Expandable) */}
              {expandedAddressId === address.address_id && (
                <div className="profilepart_addressDetails">
                  <div className="profilepart_addressFields">
                    <label>
                      Address Line:
                      <input
                        type="text"
                        name="address_line"
                        value={editedAddress.address_line}
                        onChange={handleEditChange}
                      />
                    </label>
                    <label>
                      City:
                      <input
                        type="text"
                        name="city"
                        value={editedAddress.city}
                        onChange={handleEditChange}
                      />
                    </label>
                    <label>
                      Phone Number:
                      <input
                        type="text"
                        name="phone_number"
                        value={editedAddress.phone_number}
                        onChange={handleEditChange}
                      />
                    </label>
                    <label>
                      Postal Code:
                      <input
                        type="text"
                        name="postal_code"
                        value={editedAddress.postal_code}
                        onChange={handleEditChange}
                      />
                    </label>
                    <label>
                      Country:
                      <input
                        type="text"
                        name="country"
                        value={editedAddress.country}
                        onChange={handleEditChange}
                      />
                    </label>
                  </div>
                  <div className="profilepart_addressButtons">
                    <button
                      className="profilepart_saveButton"
                      onClick={() => handleSaveChanges(address.address_id)}
                      disabled={!isModified}
                    >
                      Save Changes
                    </button>
                    <button
                      className="profilepart_deleteButton"
                      onClick={() => handleDeleteAddress(address.address_id)}
                    >
                      Delete Address
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Create New Address */}
        <div className="profilepart_newAddress">
          {isCreating ? (
            <form className="profilepart_newAddressForm" onSubmit={handleAddAddress}>
              <h4>Create New Address</h4>
              <label>
                Address Name:
                <input
                  type="text"
                  name="address_name"
                  value={newAddress.address_name}
                  onChange={handleNewAddressChange}
                  required
                />
              </label>
              <label>
                Address Line:
                <input
                  type="text"
                  name="address_line"
                  value={newAddress.address_line}
                  onChange={handleNewAddressChange}
                  required
                />
              </label>
              <label>
                City:
                <input
                  type="text"
                  name="city"
                  value={newAddress.city}
                  onChange={handleNewAddressChange}
                  required
                />
              </label>
              <label>
                Phone Number:
                <input
                  type="text"
                  name="phone_number"
                  value={newAddress.phone_number}
                  onChange={handleNewAddressChange}
                  required
                />
              </label>
              <label>
                Postal Code:
                <input
                  type="text"
                  name="postal_code"
                  value={newAddress.postal_code}
                  onChange={handleNewAddressChange}
                  required
                />
              </label>
              <label>
                Country:
                <input
                  type="text"
                  name="country"
                  value={newAddress.country}
                  onChange={handleNewAddressChange}
                  required
                />
              </label>
              <div className="profilepart_newAddressButtons">
                <button type="submit" disabled={!Object.values(newAddress).every((field) => field.trim() !== '')}>
                  Add Address
                </button>
                <button type="button" onClick={() => setIsCreating(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              className="profilepart_createAddressButton"
              onClick={() => setIsCreating(true)}
            >
              + Add New Address
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
