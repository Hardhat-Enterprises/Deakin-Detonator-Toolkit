import { IconRocket, IconScan } from "@tabler/icons";
import { useNavigate } from "react-router-dom";
import ToolItemPopover from "./ToolItemPopover";

interface ToolItemProps {
    title: string;
    description: string;
    route: string;
}

const ToolItem = ({ title, description, route }: ToolItemProps) => {
    let navigate = useNavigate();

    const handleNavigate = () => {
        navigate(route);
    };

    return (
        <>
            <td>{title}</td>
            <td>{description}</td>
            <td>
                <ToolItemPopover
                    icon={<IconRocket />}
                    color={"green"}
                    actionCallback={handleNavigate}
                    hoverText={"Go"}
                />
            </td>
        </>
    );
};

export default ToolItem;
