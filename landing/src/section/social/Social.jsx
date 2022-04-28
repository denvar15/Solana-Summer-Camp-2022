import { FaTelegram, FaDiscord, FaGithub } from "react-icons/fa";
import './style.css'
const handleClick = (url) => {
    window.open(
      url,
      "_blank" 
    );
  };
export const Social = () => {
    return (
        <div className="socialBlock">
            <FaTelegram className="socialItem"  onClick={() => {handleClick("https://t.me/crypt0steam")}}/>
            <FaDiscord className="socialItem" onClick={() => {handleClick("https://discord.gg/WdjAhg9vkA")}}/>
            <FaGithub className="socialItem"  onClick={() => {handleClick("https://github.com/k0b1x/pbs")}}/>
        </div>
    )
}
