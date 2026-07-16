import fs from 'fs'
import path from 'path'
import { sql } from '../lib/db' // Ajustez le chemin vers votre db.ts si besoin

async function seedChallenges() {
  try {
    console.log('Début de l\'importation des défis...')
    
    // Lire le fichier CSV
    const csvPath = path.join(process.cwd(), 'challenges.csv')
    const csvData = fs.readFileSync(csvPath, 'utf8')
    
    // Séparer les lignes
    const lines = csvData.split('\n')
    // Retirer la ligne d'en-tête (title,description,points)
    const headers = lines.shift() 
    
    let count = 0
    
    for (const line of lines) {
      if (!line.trim()) continue
      
      // Gérer la séparation par virgule (en prenant en compte les guillemets)
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
      if (!matches || matches.length < 3) continue
      
      const title = matches[0].replace(/^"|"$/g, '').trim()
      const description = matches[1].replace(/^"|"$/g, '').trim()
      const points = parseInt(matches[2].replace(/^"|"$/g, '').trim(), 10)
      
      if (isNaN(points)) continue

      // Insérer dans la table SQL de votre base Neon
      await sql`
        INSERT INTO challenges (title, description, points, active)
        VALUES (${title}, ${description}, ${points}, true)
        ON CONFLICT (title) DO NOTHING; 
      `
      count++
    }
    
    console.log(`Succès ! ${count} défis ont été importés avec succès.`)
  } catch (error) {
    console.error('Erreur lors de l\'importation :', error)
  }
}

seedChallenges()
