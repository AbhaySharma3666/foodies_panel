import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { fetchFoodList } from "../service/foodService";
import { addToCart, getCartData, removeQtyFromCart } from "../service/cartService";
import { logger } from "../util/logger";

export const StoreContext = createContext(null);

export const StoreContextProvider = ({ children }) => {
    const [foodList, setFoodList] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const increaseQty = useCallback(async (foodId) => {
        setQuantities((prev) => ({ ...prev, [foodId]: (prev[foodId] || 0) + 1 }));
        await addToCart(foodId, token);
    }, [token]);

    const decreaseQty = useCallback(async (foodId) => {
        setQuantities((prev) => ({
            ...prev,
            [foodId]: prev[foodId] > 0 ? prev[foodId] - 1 : 0
        }));
        await removeQtyFromCart(foodId, token);
    }, [token]);

    const removeFromCart = useCallback((foodId) => {
        setQuantities((prevQuantities) => {
            const updatedQuantities = { ...prevQuantities };
            delete updatedQuantities[foodId];
            return updatedQuantities;
        });
    }, []);

    const loadCartData = useCallback(async (authToken) => {
        if (!authToken) return;
        try {
            const items = await getCartData(authToken);
            setQuantities(items || {});
        } catch (error) {
            logger.error("Failed to load cart data:", error);
        }
    }, []);

    const contextValue = useMemo(() => ({
        foodList,
        increaseQty,
        decreaseQty,
        quantities,
        setQuantities,
        removeFromCart,
        token,
        setToken,
        loadCartData,
        loading,
    }), [foodList, increaseQty, decreaseQty, quantities, removeFromCart, token, loadCartData, loading]);

    useEffect(() => {
        let isMounted = true;

        const loadInitialData = async () => {
            try {
                setLoading(true);
                const data = await fetchFoodList();
                if (isMounted) {
                    setFoodList(data);
                }

                const storedToken = localStorage.getItem("token");
                if (storedToken && isMounted) {
                    setToken(storedToken);
                    await loadCartData(storedToken);
                }
            } catch (error) {
                logger.error("Failed to load initial data:", error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadInitialData();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <StoreContext.Provider value={contextValue}>
            {children}
        </StoreContext.Provider>
    );
};