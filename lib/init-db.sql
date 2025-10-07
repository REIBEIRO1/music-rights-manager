-- Users table (artistas, managers, colaboradores)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'artist', -- artist, manager, collaborator, publisher
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Artist profiles
CREATE TABLE IF NOT EXISTS artist_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  photo_url TEXT,
  genres TEXT[], -- array of genres
  location VARCHAR(255),
  phone VARCHAR(50),
  social_links JSONB, -- {instagram: "", spotify: "", etc}
  epk_url TEXT,
  total_streams BIGINT DEFAULT 0,
  total_concerts INTEGER DEFAULT 0,
  awards TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team members (managers, collaborators linked to artists)
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  member_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- manager, producer, musician, etc
  permissions JSONB, -- {royalties: true, releases: true, contracts: false}
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(artist_id, member_id)
);

-- Friend requests and connections
CREATE TABLE IF NOT EXISTS friendships (
  id SERIAL PRIMARY KEY,
  requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected
  tags TEXT[], -- producer, lyricist, instrumentalist, etc
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id, receiver_id)
);

-- Songs catalog
CREATE TABLE IF NOT EXISTS songs (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  isrc VARCHAR(50),
  iswc VARCHAR(50),
  upc VARCHAR(50),
  genre VARCHAR(100),
  subgenre VARCHAR(100),
  duration INTEGER, -- in seconds
  creation_date DATE,
  release_date DATE,
  status VARCHAR(50) DEFAULT 'demo', -- demo, registered, released
  cover_url TEXT,
  lyrics TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Song versions (demo, master, remix)
CREATE TABLE IF NOT EXISTS song_versions (
  id SERIAL PRIMARY KEY,
  song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
  version_name VARCHAR(100) NOT NULL, -- demo, master, remix, etc
  file_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Song files (audio, artwork, lyric sheets, stems)
CREATE TABLE IF NOT EXISTS song_files (
  id SERIAL PRIMARY KEY,
  song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
  file_type VARCHAR(50) NOT NULL, -- audio, artwork, lyric_sheet, stem
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Credits and splits
CREATE TABLE IF NOT EXISTS song_credits (
  id SERIAL PRIMARY KEY,
  song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  credit_type VARCHAR(50) NOT NULL, -- composition, production, master, publishing
  percentage DECIMAL(5,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, rejected
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contracts
CREATE TABLE IF NOT EXISTS contracts (
  id SERIAL PRIMARY KEY,
  song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
  contract_type VARCHAR(50) NOT NULL, -- publishing, master, sync
  publisher VARCHAR(255),
  territory VARCHAR(255),
  start_date DATE,
  end_date DATE,
  advance DECIMAL(12,2),
  notes TEXT,
  file_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL, -- certification, playlist, sync, milestone
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date_achieved DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Statistics (manual input for MVP)
CREATE TABLE IF NOT EXISTS song_statistics (
  id SERIAL PRIMARY KEY,
  song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- spotify, apple_music, youtube
  streams BIGINT DEFAULT 0,
  listeners BIGINT DEFAULT 0,
  top_countries JSONB, -- {US: 1000, PT: 500}
  playlists TEXT[],
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Concerts
CREATE TABLE IF NOT EXISTS concerts (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  venue VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  fee DECIMAL(12,2),
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Royalty reports
CREATE TABLE IF NOT EXISTS royalty_reports (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  file_url TEXT,
  breakdown JSONB, -- {streaming: 1000, radio: 500, sync: 200}
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- friend_request, split_confirmation, contract_expiry, etc
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_songs_owner ON songs(owner_id);
CREATE INDEX IF NOT EXISTS idx_song_credits_song ON song_credits(song_id);
CREATE INDEX IF NOT EXISTS idx_song_credits_user ON song_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_receiver ON friendships(receiver_id);
CREATE INDEX IF NOT EXISTS idx_team_members_artist ON team_members(artist_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
