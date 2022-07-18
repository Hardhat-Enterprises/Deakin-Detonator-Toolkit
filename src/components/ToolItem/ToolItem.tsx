import { Button } from "@mantine/core";
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
                <Button leftIcon={<IconRocket />} onClick={handleNavigate}>
                    Go
                </Button>
            </td>
        </>
    );
};

export default ToolItem;
