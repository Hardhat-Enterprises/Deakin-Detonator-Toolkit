import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Button, Select, Card, Text } from "@mantine/core";

type NewsItem = {
    title: string;
    link: string;
    description: string;
    pub_date: string;
};

const categories = ["All", "Malware", "Phishing", "Breach", "Zero-Day", "Ransomware", "Hacking"];

export default function NewsFeed() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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
        if (selectedCategory === "All") {
            setFilteredNews(news);
        } else {
            const lowerCategory = selectedCategory.toLowerCase();
            setFilteredNews(
                news.filter(
                    (item) =>
                        item.title.toLowerCase().includes(lowerCategory) ||
                        item.description.toLowerCase().includes(lowerCategory)
                )
            );
        }
    }, [selectedCategory, news]);

    return (
        <div style={{ padding: "1rem" }}>
            {/* Header with Refresh */}
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

            {/* Category Dropdown (only small) */}
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

            {/* Error/Loading */}
            {loading && <Text>Loading news...</Text>}
            {error && <Text color="red">{error}</Text>}

            {/* News Feed Full Width */}
            <ul style={{ listStyle: "none", padding: 0 }}>
                {filteredNews.map((item, index) => (
                    <li
                        key={index}
                        style={{
                            marginBottom: "1rem",
                            padding: "1rem",
                            border: "1px solid #444",
                            borderRadius: "8px",
                            backgroundColor: "#1a1a1a",
                        }}
                    >
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
                        <p style={{ fontSize: "0.8rem", color: "#aaa", margin: "0.3rem 0" }}>{item.pub_date}</p>
                        <p style={{ fontSize: "0.9rem", color: "#ccc" }}>{item.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
