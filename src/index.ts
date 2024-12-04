import fs from 'fs'
import path from 'path'
import { InstagramAnalyzer } from './utils/instagram-analyzer'

// Read JSON files
const followersData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/followers/followers_1.json'), 'utf8'),
)
const followingData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/following/following.json'), 'utf8'),
)

const analyzer = new InstagramAnalyzer(
  followersData.relationships_followers || [],
  followingData.relationships_following || [],
)

const nonFollowingBack = analyzer.getNonFollowingBack()

// Console output
console.log('\nUsers not following you back:')
console.log('============================')
nonFollowingBack.forEach((user) => {
  console.log(`Username: ${user.username}`)
  console.log(`Profile: ${user.profileUrl}`)
  console.log(`Followed since: ${user.followedSince.toLocaleDateString()}`)
  console.log('----------------------------')
})

// Save as JSON
fs.writeFileSync(
  path.join(__dirname, '../output/non_following_back.json'),
  JSON.stringify(nonFollowingBack, null, 2),
)

// Generate HTML table
const htmlTable = `
<!DOCTYPE html>
<html>
<head>
  <style>
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h2>Users Not Following Back</h2>
  <table>
    <tr>
      <th>Username</th>
      <th>Profile URL</th>
      <th>Followed Since</th>
    </tr>
    ${nonFollowingBack
      .map(
        (user) => `
      <tr>
        <td>${user.username}</td>
        <td><a href="${user.profileUrl}" target="_blank">${user.profileUrl}</a></td>
        <td>${user.followedSince.toLocaleDateString()}</td>
      </tr>
    `,
      )
      .join('')}
  </table>
</body>
</html>
`

fs.writeFileSync(path.join(__dirname, '../output/non_following_back.html'), htmlTable)
