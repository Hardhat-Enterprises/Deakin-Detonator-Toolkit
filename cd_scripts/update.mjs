// @ts-nocheck
import fetch from "node-fetch";
import { getOctokit, context } from "@actions/github";

const UPDATE_TAG_NAME = "updater";
const UPDATE_FILE_NAME = "update.json";

const getSignature = async (url) => {
    const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/octet-stream" },
    });
    return response.text();
};

const updateData = {
    version: "",
    pub_date: new Date().toISOString(),
    platforms: {
        linux: { signature: "", url: "" },
        "linux-x86_64": { signature: "", url: "" },
    },
};

const octokit = getOctokit(process.env.GITHUB_TOKEN);
const options = { owner: context.repo.owner, repo: context.repo.repo };

const { data: release } = await octokit.rest.repos.getLatestRelease(options);
updateData.version = release.tag_name;
// eslint-disable-next-line camelcase
for (const { name, browser_download_url } of release.assets) {
    if (name.endsWith(".AppImage.tar.gz")) {
        // eslint-disable-next-line camelcase
        updateData.platforms.linux.url = browser_download_url;
        // eslint-disable-next-line camelcase
        updateData.platforms["linux-x86_64"].url = browser_download_url;
    } else if (name.endsWith(".AppImage.tar.gz.sig")) {
        // eslint-disable-next-line no-await-in-loop
        const signature = await getSignature(browser_download_url);
        updateData.platforms.linux.signature = signature;
        updateData.platforms["linux-x86_64"].signature = signature;
    }
}

const { data: updater } = await octokit.rest.repos.getReleaseByTag({
    ...options,
    tag: UPDATE_TAG_NAME,
    version: UPDATE_TAG_NAME,
});

for (const { id, name } of updater.assets) {
    if (name === UPDATE_FILE_NAME) {
        // eslint-disable-next-line no-await-in-loop
        await octokit.rest.repos.deleteReleaseAsset({ ...options, asset_id: id });
        break;
    }
}

await octokit.rest.repos.uploadReleaseAsset({
    ...options,
    release_id: updater.id,
    name: UPDATE_FILE_NAME,
    data: JSON.stringify(updateData),
});
