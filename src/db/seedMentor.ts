import bcrypt from 'bcrypt';
import config from '../config';
import prisma from '../shared/prisma';

const seedMentor = async () => {
  const email = config.mentor_email;
  const password = config.mentor_password;
  const name = config.mentor_name;

  if (!email || !password) {
    console.log('Mentor seed skipped — MENTOR_EMAIL or MENTOR_PASSWORD not set in env');
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return; // already seeded
  }

  const hashedPassword = await bcrypt.hash(password, config.bcrypt_salt_round);
  await prisma.user.create({
    data: { name: name || 'Head Mentor', email, password: hashedPassword, role: 'MENTOR' },
  });

  console.log(`Mentor seeded: ${email}`);
};

export default seedMentor;
