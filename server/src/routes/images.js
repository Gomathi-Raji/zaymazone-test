import { Router } from 'express'
import { getImageByFilename, getImageStream, uploadImageToGridFS } from '../services/imageService.js'
import multer from 'multer'
import fs from 'fs'
import path from 'path'

import cors from 'cors'

const router = Router()
// Remove helmet's cross-origin policies that conflict
router.use((req, res, next) => {
  res.removeHeader('Cross-Origin-Opener-Policy')
  res.removeHeader('Cross-Origin-Resource-Policy')
  next()
})
// Apply permissive CORS for images
router.use(cors({ origin: '*' }))

// Handle preflight for all image routes
router.options('*', (req, res) => res.sendStatus(200))

// Serve image by filename
router.get('/:filename', async (req, res) => {
  try {
    // CORS middleware applied, no further headers needed
    
    const { filename } = req.params
    
    // Find image metadata
    const imageDoc = await getImageByFilename(filename)
    if (!imageDoc) {
      return res.status(404).json({ error: 'Image not found' })
    }

    // Set proper headers
    res.set('Content-Type', imageDoc.contentType)
    res.set('Content-Length', imageDoc.size)
    res.set('Cache-Control', 'public, max-age=31536000') // Cache for 1 year

    // Stream image from GridFS
    const downloadStream = getImageStream(imageDoc.gridfsId)
    
    downloadStream.on('error', (error) => {
      console.error('Error streaming image:', error)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error serving image' }) // CORS headers already applied
      }
    })

    downloadStream.pipe(res)
    
  } catch (error) {
    console.error('Image serve error:', error)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' }) // CORS headers already applied
    }
  }
})

// Get image metadata
router.get('/:filename/info', async (req, res) => {
  try {
    const { filename } = req.params
    const imageDoc = await getImageByFilename(filename)
    
    if (!imageDoc) {
      return res.status(404).json({ error: 'Image not found' })
    }

    res.json({
      id: imageDoc._id,
      filename: imageDoc.filename,
      originalName: imageDoc.originalName,
      contentType: imageDoc.contentType,
      size: imageDoc.size,
      category: imageDoc.category,
      uploadDate: imageDoc.uploadDate
    })
  } catch (error) {
    console.error('Get image info error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router