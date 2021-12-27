import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
const Login = () => {
  const [cookies, setCookie] = useCookies(["spotify"]);
  const navigate = useNavigate();

  const launchLog = async () => {
    if (!cookies.spotify) {
      const log = await axios.get("http://localhost:3000/spotify/login");
      window.open(
        log.data,
        "Spotify Login",
        "toolbar=no,location=no,directories=no,status=no, menubar=no,scrollbars=no,resizable=no,width=300,height=600"
      );
      window.location.reload();
    } else {
        navigate('/artists')
    }
  };

  useEffect(() => {
    launchLog();
  }, []);

  return <div></div>;
};

export default Login;