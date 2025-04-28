import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Button, Select, Card, Text, Group, Badge, TextInput } from "@mantine/core";
import { writeTextFile, BaseDirectory } from "@tauri-apps/api/fs";
import { showNotification } from "@mantine/notifications";

type NewsItem = {
    title: string;
    link: string;
    description: string;
    pub_date: string;
};

const categories = ["All", "Malware", "Phishing", "Breach", "Zero-Day", "Ransomware", "Hacking"];

const categoryColors: { [key: string]: string } = {
    Malware: "red",
    Phishing: "orange",
    Breach: "grape",
    "Zero-Day": "blue",
    Ransomware: "cyan",
    Hacking: "green",
};

function detectCategory(item: NewsItem): string | null {
    const text = (item.title + " " + item.description).toLowerCase();
    for (const category of categories) {
        if (category !== "All" && text.includes(category.toLowerCase())) {
            return category;
        }
    }
    return null;
}

export default function NewsFeed() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [visibleCount, setVisibleCount] = useState<number>(5); // 👈 New state for Load More

    const fetchNews = () => {
        setRefreshing(true);
        invoke<NewsItem[]>("fetch_hacker_news")
            .then((result) => {
                setNews(result);
                setFilteredNews(result);
                setError("");
                setLastUpdated(new Date());
            })
            .catch((err) => {
                console.error("Error fetching news:", err);
                setError("Failed to load news");
            })
            .finally(() => {
                setLoading(false);
                setRefreshing(false);
            });
    };

    useEffect(() => {
        fetchNews();
    }, []);

    useEffect(() => {
        filterNews();
    }, [selectedCategory, searchQuery, news]);

    const filterNews = () => {
        let filtered = [...news];

        if (selectedCategory !== "All") {
            const lowerCategory = selectedCategory.toLowerCase();
            filtered = filtered.filter(
                (item) =>
                    item.title.toLowerCase().includes(lowerCategory) ||
                    item.description.toLowerCase().includes(lowerCategory)
            );
        }

        if (searchQuery.trim() !== "") {
            const lowerSearch = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (item) =>
                    item.title.toLowerCase().includes(lowerSearch) ||
                    item.description.toLowerCase().includes(lowerSearch)
            );
        }

        setFilteredNews(filtered);
        setVisibleCount(5); // Reset visible count on every new filter/search
    };

    const saveArticle = async (item: NewsItem) => {
        const safeTitle = item.title ? item.title.replace(/[<>:"/\\|?*]+/g, "").slice(0, 50) : "Article";
        const content = `
===========================
📰 CYBERSECURITY ARTICLE
===========================

Title: ${item.title}
Date: ${item.pub_date}

🔗 Link to Full Article:
${item.link}

📄 Summary:
${item.description}

(Click the above link to read the full article.)
    `;

        try {
            await writeTextFile(
                {
                    path: `${safeTitle}.txt`,
                    contents: content,
                },
                { dir: BaseDirectory.Desktop }
            );

            showNotification({
                title: "Article Saved",
                message: `Saved as ${safeTitle}.txt on Desktop 📂`,
                color: "green",
            });
        } catch (error) {
            console.error("Error saving file:", error);

            showNotification({
                title: "Save Failed",
                message: "Could not save the article ❌",
                color: "red",
            });
        }
    };

    return (
        <div style={{ padding: "1rem" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>📰 Cybersecurity News</h2>
                <Button size="xs" variant="light" onClick={fetchNews} loading={refreshing}>
                    🔄 Refresh
                </Button>
            </div>

            {/* Last Updated */}
            {lastUpdated && (
                <Text size="xs" color="dimmed" mb="md">
                    Last updated:{" "}
                    {new Intl.DateTimeFormat("en-AU", {
                        timeZone: "Australia/Melbourne",
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                    }).format(lastUpdated)}
                </Text>
            )}

            {/* Category Dropdown */}
            <div style={{ marginBottom: "1rem", maxWidth: "250px" }}>
                <Select
                    label="Select Category"
                    placeholder="Pick one"
                    data={categories}
                    value={selectedCategory}
                    onChange={(value) => setSelectedCategory(value || "All")}
                    radius="md"
                    size="sm"
                    searchable
                    nothingFound="No categories found"
                    withAsterisk={false}
                />
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: "1rem" }}>
                <TextInput
                    placeholder="Search news..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.currentTarget.value)}
                    radius="md"
                    size="sm"
                />
            </div>

            {/* Error/Loading */}
            {loading && <Text>Loading news...</Text>}
            {error && <Text color="red">{error}</Text>}

            {/* News List */}
            <div style={{ marginTop: "1rem" }}>
                {filteredNews.slice(0, visibleCount).map((item, index) => {
                    const detectedCategory = detectCategory(item);

                    return (
                        <Card
                            key={index}
                            shadow="xs"
                            radius="md"
                            withBorder
                            p="md"
                            mb="sm"
                            style={{ backgroundColor: "#1f1f1f" }}
                        >
                            <Group position="apart" style={{ marginBottom: "0.5rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            color: "#4dabf7",
                                            fontWeight: "bold",
                                            fontSize: "1rem",
                                            textDecoration: "none",
                                        }}
                                    >
                                        {item.title}
                                    </a>

                                    {/* 🏷️ Badge */}
                                    {detectedCategory && (
                                        <Badge color={categoryColors[detectedCategory]} size="sm" variant="filled">
                                            {detectedCategory}
                                        </Badge>
                                    )}
                                </div>

                                {/* 💾 Save Button */}
                                <Button size="xs" variant="outline" color="green" onClick={() => saveArticle(item)}>
                                    💾 Save
                                </Button>
                            </Group>

                            <Text size="xs" color="dimmed" mt="xs">
                                {item.pub_date}
                            </Text>
                            <Text size="sm" mt="xs" color="gray">
                                {item.description}
                            </Text>
                        </Card>
                    );
                })}
            </div>

            {/* Load More Button */}
            {visibleCount < filteredNews.length && (
                <Button fullWidth mt="md" variant="light" onClick={() => setVisibleCount((prev) => prev + 5)}>
                    🔽 Load More
                </Button>
            )}
        </div>
    );
}
