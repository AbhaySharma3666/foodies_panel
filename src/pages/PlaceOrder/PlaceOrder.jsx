import React, { useContext, useState } from "react";
import "./PlaceOrder.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { calculateCartTotal } from "../../util/cartUtils";
import axios from "axios";
import { toast } from "react-toastify";
import { RAZORPAY_KEY } from "../../util/contants";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, AXIOS_CONFIG } from "../../config/api";
import { logger } from "../../util/logger";

const axiosInstance = axios.create(AXIOS_CONFIG);

const PlaceOrder = () => {
  const { foodList, quantities, setQuantities, token } =
    useContext(StoreContext);

  const navigate = useNavigate();

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    state: "",
    city: "",
    zip: "",
  });

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const orderData = {
      userAddress: `${data.firstName} ${data.lastName}, ${data.address}, ${data.city}, ${data.state},${data.zip}`,
      phoneNumber: data.phoneNumber,
      email: data.email,
      orderedItems: cartItems.map((item) => ({
        foodId: item.foodId,
        quantity: quantities[item.id],
        price: item.price * quantities[item.id],
        category: item.category,
        imageUrl: item.imageUrl,
        description: item.description,
        name: item.name,
      })),
      amount: total.toFixed(2),
      orderStatus: "Preparing",
    };

    try {
      const response = await axios.post(
        "http://localhost:8080/api/orders/create",
        orderData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.status === 201 && response.data.razorpayOrderId) {
        initiateRazorpayPayment(response.data);
      } else {
        toast.error("Failed to place order. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
      console.log(error);
    }
  };

  const initiateRazorpayPayment = (order) => {
    const options = {
      key: RAZORPAY_KEY,
      amount: order.amount, // amount in paise
      currency: "INR",
      name: "Foodies",
      description: "Food Order Payment",
      order_id: order.razorpayOrderId,
      handler: async function (razorpayResponse) {
        await verifyPayment(razorpayResponse, order);
      },
      prefill: {
        name: data.firstName + " " + data.lastName,
        email: data.email,
        contact: data.phoneNumber,
      },
      theme: { color: "#3399cc" },
      modal: {
        ondismiss: async function () {
          toast.error("Payment cancelled");
          await deleteOrder(order.id);
        },
      },
    };
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const verifyPayment = async (razorpayResponse) => {
    const paymentData = {
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_order_id: razorpayResponse.razorpay_order_id || order.razorpayOrderId,
      razorpay_signature: razorpayResponse.razorpay_signature,
    };
    let response;
    try {
      response = await axios.post(
      "http://localhost:8080/api/orders/verify",
      paymentData,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    } catch (error) {
       toast.error("Payment verification failed");
    }
    
    try {
      if (response.status === 200) {
        toast.success("Payment verified successfully!");
        await clearCart();
        navigate("/myorders");
      } else {
        toast.error("Failed to verify payment.");
        navigate("/");
      }
    } catch (error) {
      toast.error("Failed to verify payment.");
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      await axios.delete(`http://localhost:8080/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      toast.error(
        "Something went wrong while cancelling the order. Please contact support.",
      );
    }
  };

  const clearCart = async () => {
    try {
      if (cartItems.length === 0) {
        logger.warn("Cart is already empty");
        setQuantities({});
        return;
      }
      if (!token) {
        logger.warn("No token available for clearing cart");
        setQuantities({});
        return;
      }
      await axiosInstance.delete(API_ENDPOINTS.CART.BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuantities({});
    } catch (error) {
      if (error.response?.status === 403) {
        logger.error("Authentication failed while clearing cart");
        // Still clear local cart even if API fails
        setQuantities({});
      } else if (error.code === 'ECONNABORTED') {
        logger.error("Clear cart request timed out");
        // Clear local cart anyway
        setQuantities({});
      } else {
        logger.error("Error clearing cart:", error);
        // Still try to clear local cart
        setQuantities({});
      }
    }
  };

  // cart item component
  const cartItems = foodList.filter((food) => quantities[food.id] > 0);

  // calculation
  const { subtotal, shipping, tax, total } = calculateCartTotal(
    cartItems,
    quantities,
  );
  return (
    <div className="container mt-5">
      <main>
        <div className="py-5 text-center">
          <img
            className="d-block mx-auto"
            src={assets.logo}
            alt=""
            width="98"
            height="98"
          />
        </div>
        <div className="row g-5">
          {/* Billing Form LEFT */}
          <div className="col-md-7 col-lg-8">
            <h4 className="mb-3">Billing address</h4>

            <form className="needs-validation" onSubmit={onSubmitHandler}>
              <div className="row g-3">
                <div className="col-sm-6">
                  <label htmlFor="firstName" className="form-label">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className="form-control"
                    required
                    name="firstName"
                    onChange={onChangeHandler}
                    value={data.firstName}
                  />
                </div>

                <div className="col-sm-6">
                  <label htmlFor="lastName" className="form-label">
                    Last name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    className="form-control"
                    required
                    name="lastName"
                    onChange={onChangeHandler}
                    value={data.lastName}
                  />
                </div>

                <div className="col-12">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="you@example.com"
                    required
                    name="email"
                    onChange={onChangeHandler}
                    value={data.email}
                  />
                </div>

                <div className="col-12">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="phone"
                    placeholder="1234567890"
                    name="phoneNumber"
                    value={data.phoneNumber}
                    onChange={onChangeHandler}
                    required
                  />
                </div>

                <div className="col-12">
                  <label htmlFor="address" className="form-label">
                    Address
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="address"
                    placeholder="1234 Main St"
                    name="address"
                    value={data.address}
                    onChange={onChangeHandler}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="state" className="form-label">
                    State
                  </label>
                  <select
                    className="form-select"
                    id="state"
                    required
                    name="state"
                    onChange={onChangeHandler}
                    value={data.state}
                  >
                    <option value="">Choose...</option>
                    <option>Andhra Pradesh</option>
                    <option>Arunachal Pradesh</option>
                    <option>Chhattisgarh</option>
                    <option>Goa</option>
                    <option>Haryana</option>
                    <option>Karnataka</option>
                    <option>Maharashtra</option>
                    <option>Madhya Pradesh</option>
                    <option>Odisha</option>
                    <option>Punjab</option>
                    <option>Rajasthan</option>
                    <option>Tamil Nadu</option>
                    <option>Telangana</option>
                    <option>Uttar Pradesh</option>
                    <option>Uttarakhand</option>
                  </select>
                </div>

                <div className="col-md-5">
                  <label htmlFor="city" className="form-label">
                    City
                  </label>
                  <select
                    className="form-select"
                    id="city"
                    required
                    name="city"
                    onChange={onChangeHandler}
                    value={data.city}
                  >
                    <option value="">Choose...</option>
                    <option>Hyderabad</option>
                    <option>Visakhapatnam</option>
                    <option>Vijayawada</option>
                    <option>Guwahati</option>
                    <option>Chandigarh</option>
                    <option>Bengaluru</option>
                    <option>Mumbai</option>
                    <option>Indore</option>
                    <option>Bhubaneswar</option>
                    <option>Chandigarh</option>
                    <option>Jaipur</option>
                    <option>Chennai</option>
                    <option>Hyderabad</option>
                    <option>Lucknow</option>
                    <option>Dehradun</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label htmlFor="zip" className="form-label">
                    Zip
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="zip"
                    name="zip"
                    value={data.zip}
                    onChange={onChangeHandler}
                    required
                  />
                </div>
              </div>

              <hr className="my-4" />

              <button
                className="w-100 btn btn-primary btn-lg"
                type="submit"
                disabled={cartItems.length === 0}
              >
                Continue to checkout
              </button>
            </form>
          </div>

          {/* Cart RIGHT */}
          <div className="col-md-5 col-lg-4 order-md-last">
            <h4 className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-primary">Your cart</span>
              <span className="badge bg-primary rounded-pill">
                {cartItems.length}
              </span>
            </h4>

            <ul className="list-group mb-3">
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  className="list-group-item d-flex justify-content-between"
                >
                  <div>
                    <h6 className="my-0">{item.name}</h6>
                    <small className="text-muted">
                      Qty: {quantities[item.id]}
                    </small>
                  </div>
                  <span className="text-body-secondary">
                    &#8377;{item.price * quantities[item.id]}
                  </span>
                </li>
              ))}

              <li className="list-group-item d-flex justify-content-between">
                <div>
                  <span>Shipping</span>
                </div>
                <span>&#8377;{subtotal === 0 ? 0.0 : shipping.toFixed(2)}</span>
              </li>

              <li className="list-group-item d-flex justify-content-between">
                <div>
                  <span className="text-muted">GST</span>
                </div>
                <span>&#8377;{tax.toFixed(2)}</span>
              </li>

              <li className="list-group-item d-flex justify-content-between">
                <span>Total (INR)</span>
                <strong>&#8377;{total.toFixed(2)}</strong>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlaceOrder;
