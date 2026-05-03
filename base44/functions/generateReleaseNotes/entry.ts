import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role === 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { version, previousTag } = await req.json();

    // Get GitHub connector
    const connectorId = "69e6ef79b8560c81acb30cf1";
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(connectorId);

    const repo = "collins73/HVAC-climate-bms";

    // Fetch tags to find latest release
    let lastTag = previousTag;
    if (!lastTag) {
      const tagsRes = await fetch(`https://api.github.com/repos/${repo}/tags?per_page=1`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const tags = await tagsRes.json();
      lastTag = tags[0]?.name || null;
    }

    // Fetch commits between tags
    let commits = [];
    if (lastTag) {
      const compareRes = await fetch(
        `https://api.github.com/repos/${repo}/compare/${lastTag}...HEAD`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      const data = await compareRes.json();
      commits = data.commits || [];
    } else {
      const commitsRes = await fetch(
        `https://api.github.com/repos/${repo}/commits?per_page=50`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      commits = await commitsRes.json();
    }

    // Parse commits into categories
    const categories = {
      features: [],
      fixes: [],
      improvements: [],
      security: [],
      docs: [],
      other: []
    };

    commits.forEach(commit => {
      const msg = commit.commit.message.toLowerCase();
      const title = commit.commit.message.split('\n')[0];

      if (msg.includes('feat') || msg.includes('feature')) {
        categories.features.push(title);
      } else if (msg.includes('fix') || msg.includes('bug')) {
        categories.fixes.push(title);
      } else if (msg.includes('improve') || msg.includes('perf')) {
        categories.improvements.push(title);
      } else if (msg.includes('security')) {
        categories.security.push(title);
      } else if (msg.includes('doc') || msg.includes('readme')) {
        categories.docs.push(title);
      } else {
        categories.other.push(title);
      }
    });

    // Generate markdown release notes
    let releaseNotes = `# Release ${version}\n\n`;
    releaseNotes += `_Released: ${new Date().toISOString().split('T')[0]}_\n\n`;

    if (categories.security.length > 0) {
      releaseNotes += `## 🔒 Security\n`;
      categories.security.forEach(title => {
        releaseNotes += `- ${title}\n`;
      });
      releaseNotes += '\n';
    }

    if (categories.features.length > 0) {
      releaseNotes += `## ✨ Features\n`;
      categories.features.forEach(title => {
        releaseNotes += `- ${title}\n`;
      });
      releaseNotes += '\n';
    }

    if (categories.improvements.length > 0) {
      releaseNotes += `## 📈 Improvements\n`;
      categories.improvements.forEach(title => {
        releaseNotes += `- ${title}\n`;
      });
      releaseNotes += '\n';
    }

    if (categories.fixes.length > 0) {
      releaseNotes += `## 🐛 Fixes\n`;
      categories.fixes.forEach(title => {
        releaseNotes += `- ${title}\n`;
      });
      releaseNotes += '\n';
    }

    if (categories.docs.length > 0) {
      releaseNotes += `## 📚 Documentation\n`;
      categories.docs.forEach(title => {
        releaseNotes += `- ${title}\n`;
      });
      releaseNotes += '\n';
    }

    if (categories.other.length > 0) {
      releaseNotes += `## 📦 Other Changes\n`;
      categories.other.forEach(title => {
        releaseNotes += `- ${title}\n`;
      });
      releaseNotes += '\n';
    }

    releaseNotes += `---\n**Total Commits:** ${commits.length}\n`;

    // Create GitHub release
    const releaseRes = await fetch(`https://api.github.com/repos/${repo}/releases`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tag_name: `v${version}`,
        name: `Release ${version}`,
        body: releaseNotes,
        draft: false,
        prerelease: false
      })
    });

    if (!releaseRes.ok) {
      const error = await releaseRes.json();
      return Response.json({ error: error.message }, { status: releaseRes.status });
    }

    const release = await releaseRes.json();
    return Response.json({
      success: true,
      releaseUrl: release.html_url,
      releaseNotes,
      totalCommits: commits.length,
      stats: {
        features: categories.features.length,
        fixes: categories.fixes.length,
        improvements: categories.improvements.length,
        security: categories.security.length,
        docs: categories.docs.length
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});