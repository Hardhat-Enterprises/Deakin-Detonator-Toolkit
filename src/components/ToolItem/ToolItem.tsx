import { Button } from "@mantine/core";
import { IconRocket } from "@tabler/icons";
import { useNavigate } from "react-router-dom";

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
        <tr>
            <td>{title}</td>
            <td>{description}</td>
            <td>
                <Button leftIcon={<IconRocket />} onClick={handleNavigate}>
                    Go
                </Button>
            </td>
        </tr>
    );
};

export default ToolItem;
