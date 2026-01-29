import { useReducer, useEffect, createContext } from 'react';
import api from '../services/api.service';


// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

const initialState = {
    user: null,
    token: null,
    loading: true
};

function authReducer(state, action) {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                loading: false
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                token: null,
                loading: false
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload
            };
        case 'INITIALIZE':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                loading: false
            };
        default:
            return state;
    }
}

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    const response = await api.get('/auth/profile');
                    dispatch({
                        type: 'INITIALIZE',
                        payload: {
                            user: response.data,
                            token
                        }
                    });
                } catch {
                    localStorage.removeItem('authToken');
                    dispatch({ type: 'LOGOUT' });
                }
            } else {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        initializeAuth();
    }, []);

    const login = async (credentials) => {
        const { data } = await api.post('/auth/login', credentials);
        localStorage.setItem('authToken', data.token);
        dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
                user: data.user,
                token: data.token
            }
        });
        return data;
    };

    const signup = async (userData) => {
        const { data } = await api.post('/auth/signup', userData);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        dispatch({ type: 'LOGOUT' });
    };

    const value = {
        ...state,
        login,
        signup,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}