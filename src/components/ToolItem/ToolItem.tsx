import { Button } from "@mantine/core";
import { IconRocket } from "@tabler/icons";
import { useNavigate } from "react-router";

interface ToolItemProps {
    title: string;
    description: string;
    route: string;
    category: string;
}

const ToolItem = ({ title, description, route, category }: ToolItemProps) => {
    let navigate = useNavigate();

    const handleNavigate = () => {
        navigate(route);
    };

    return (
        <tr>
            <td>{title}</td>
            <td>{description}</td>
            <td>{category}</td>
            <td>
                <Button leftIcon={<IconRocket />} onClick={handleNavigate}>
                    Go
                </Button>
            </td>
        </tr>
    );
};

export default ToolItem;
