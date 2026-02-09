import { useEffect, useContext, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/authContext";
import { useLoginUser } from "@/controllers/API/queries/auth";
import { LoadingPage } from "../LoadingPage";
import useAlertStore from "../../stores/alertStore";

export default function SSOLoginPage() {
    const [searchParams] = useSearchParams();
    const { login, clearAuthSession } = useContext(AuthContext);
    const { mutate } = useLoginUser();
    const navigate = useNavigate();
    const setErrorData = useAlertStore((state) => state.setErrorData);

    // Use a ref to prevent double-firing in StrictMode
    const hasAttemptedRef = useRef(false);

    useEffect(() => {
        if (hasAttemptedRef.current) return;
        hasAttemptedRef.current = true;

        const flow_id = searchParams.get("flow_id");
        const username = searchParams.get("username");
        const token = searchParams.get("token");

        // Retrieve custom param if present (e.g. from V1 redirect)
        // Though usually it's path based. We'll stick to standard navigation.

        if (!username || !token) {
            console.error("SSO: Missing credentials");
            navigate("/login");
            return;
        }

        // Call login API
        mutate(
            { username: username.trim(), password: token.trim() },
            {
                onSuccess: (data) => {
                    console.log(`SSO Success for ${username}`);
                    clearAuthSession();
                    login(data.access_token, "login", data.refresh_token);

                    if (flow_id) {
                        // Force hard navigation to ensure fresh state/routers
                        window.location.href = `/flow/${flow_id}`;
                    } else {
                        window.location.href = "/";
                    }
                },
                onError: (error) => {
                    console.error("SSO Failed", error);
                    setErrorData({
                        title: "SSO Login Failed",
                        list: ["Could not sign in with provided credentials."],
                    });
                    navigate("/login");
                },
            }
        );
    }, []);

    return <LoadingPage overlay />;
}
