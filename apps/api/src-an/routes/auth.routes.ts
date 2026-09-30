// apps/api/src/routes/auth.routes.ts
import { Router } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { db } from '../utils/db';

const router = Router();

// Webhook pour synchroniser les utilisateurs Clerk avec notre DB
router.post('/webhook/clerk', async (req, res) => {
  const { data, type } = req.body;

  try {
    if (type === 'user.created' || type === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = data;
      
      const userData = {
        clerkId: id,
        email: email_addresses[0]?.email_address,
        nom: last_name,
        prenom: first_name,
        role: 'ELEVE', // Par défaut
      };

      await db.user.upsert({
        where: { clerkId: id },
        update: userData,
        create: userData,
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Obtenir l'utilisateur actuel
router.get('/me', async (req, res) => {
  try {
    const userId = req.auth.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        eleve: {
          include: { classe: true }
        },
        enseignant: true,
        parent: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;