import { useEffect, useState } from "react";
import {
  Button,
  Select,
  Card,
  Text,
  Group,
  Badge,
  TextInput,
  Transition,
} from "@mantine/core";
import { writeTextFile, readTextFile, BaseDirectory } from "@tauri-apps/api/fs";
import { showNotification } from "@mantine/notifications";
import { invoke } from "@tauri-apps/api/tauri";

type NewsItem = {
  title: string;
  link: string;
  description: string;
  pub_date: string;
};

const categories = [
  "All",
  "Malware",
  "Phishing",
  "Breach",
  "Zero-Day",
  "Ransomware",
  "Hacking",
];

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
  const [visibleCount, setVisibleCount] = useState<number>(5);

  const fetchNews = async () => {
    setRefreshing(true);
    try {
      const result = await invoke<NewsItem[]>("fetch_hacker_news");
      setNews(result);
      setFilteredNews(result);
      setError("");
      setLastUpdated(new Date());
      await writeTextFile(
        {
          path: "cached_news.json",
          contents: JSON.stringify(result),
        },
        { dir: BaseDirectory.Desktop }
      );
      showNotification({
        title: "News Refreshed",
        message: "Latest news loaded successfully ✅",
        color: "green",
      });
    } catch (err) {
      try {
        const cached = await readTextFile("cached_news.json", { dir: BaseDirectory.Desktop });
        const cachedNews: NewsItem[] = JSON.parse(cached);
        setNews(cachedNews);
        setFilteredNews(cachedNews);
        setError("Offline Mode: Showing cached news");
        showNotification({
          title: "Offline Mode",
          message: "Loaded cached news from Desktop 📂",
          color: "yellow",
        });
      } catch (cacheError) {
        setError("Failed to load news. No internet and no cache available.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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
      filtered = filtered.filter((item) =>
        (item.title + item.description).toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((item) =>
        (item.title + item.description).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredNews(filtered);
    setVisibleCount(5);
  };

  const saveArticle = async (item: NewsItem) => {
    const safeTitle = item.title.replace(/[<>:"/\\|?*]+/g, "").slice(0, 50);
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
      showNotification({
        title: "Save Failed",
        message: "Could not save the article ❌",
        color: "red",
      });
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>📰 Cybersecurity News</h2>
        <Button size="xs" variant="light" onClick={fetchNews} loading={refreshing}>
          🔄 Refresh
        </Button>
      </div>

      {lastUpdated && (
        <Text size="xs" color="dimmed" mb="md">
          Last updated: {lastUpdated.toLocaleTimeString("en-AU", { timeZone: "Australia/Melbourne" })}
        </Text>
      )}

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
        />
      </div>

      <TextInput
        placeholder="Search news..."
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.currentTarget.value)}
        radius="md"
        size="sm"
        mb="md"
      />

      {loading && <Text>Loading news...</Text>}
      {error && <Text color={error.startsWith("Offline") ? "yellow" : "red"}>{error}</Text>}

      {filteredNews.slice(0, visibleCount).map((item, index) => {
        const category = detectCategory(item);
        return (
          <Transition key={index} mounted transition="fade" duration={400} timingFunction="ease">
            {(styles) => (
              <Card shadow="xs" radius="md" withBorder p="md" mb="sm" style={{ backgroundColor: "#1f1f1f", ...styles }}>
                <Group position="apart" style={{ marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#4dabf7", fontWeight: "bold", fontSize: "1rem", textDecoration: "none" }}
                    >
                      {item.title}
                    </a>
                    {category && (
                      <Badge color={categoryColors[category]} size="sm" variant="filled">
                        {category}
                      </Badge>
                    )}
                  </div>
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
            )}
          </Transition>
        );
      })}

      {visibleCount < filteredNews.length && (
        <Button fullWidth mt="md" variant="light" onClick={() => setVisibleCount((prev) => prev + 5)}>
          🔽 Load More
        </Button>
      )}
    </div>
  );
}
