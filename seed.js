const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio_db';

// Copy Schemas from server.js
const profileSchema = new mongoose.Schema({
    name: String,
    subtitle: String,
    description: String,
    quote: String,
    profileImg: String
});

const educationSchema = new mongoose.Schema({
    institution: String,
    level: String,
    logo: String,
    order: Number
});

const projectSchema = new mongoose.Schema({
    title: String,
    category: String,
    description: String,
    media: String,
    mediaType: { type: String, enum: ['image', 'video'] },
    link: String,
    order: Number
});

const achievementSchema = new mongoose.Schema({
    date: String,
    title: String,
    description: String,
    order: Number
});

const skillSchema = new mongoose.Schema({
    name: String,
    icon: String,
    order: Number
});

const documentationSchema = new mongoose.Schema({
    title: String,
    date: String,
    media: String,
    link: String,
    order: Number
});

const Profile = mongoose.model('Profile', profileSchema);
const Education = mongoose.model('Education', educationSchema);
const Project = mongoose.model('Project', projectSchema);
const Achievement = mongoose.model('Achievement', achievementSchema);
const Skill = mongoose.model('Skill', skillSchema);
const Documentation = mongoose.model('Documentation', documentationSchema);

const seedData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Terhubung ke MongoDB untuk seeding...');

        // Clear existing data
        await Profile.deleteMany({});
        await Education.deleteMany({});
        await Project.deleteMany({});
        await Achievement.deleteMany({});
        await Skill.deleteMany({});
        await Documentation.deleteMany({});

        // 1. Profile
        await new Profile({
            name: "Rafan Parsa Putra Rustaman",
            subtitle: "Pelajar",
            description: "Halo, perkenalkan saya Rafan Parsa Putra Rustaman, berusia 18 tahun. Saya memiliki ketertarikan yang kuat di bidang organisasi dan aktif terlibat dalam berbagai kepanitiaan sekolah, khususnya di Divisi PDD (Publikasi, Dokumentasi, dan Desain). Saya memiliki keahlian dalam fotografi, videografi, serta desain grafis. Melalui kegiatan tersebut, saya terbiasa membuat berbagai desain publikasi, mendokumentasikan kegiatan, serta mengelola konten visual untuk keperluan acara sekolah.",
            quote: "Become the best among the best",
            profileImg: "assets/Foto Profil.png"
        }).save();

        // 2. Education
        await Education.insertMany([
            { institution: "TK Kota Ilmu", level: "TK", logo: "assets/LOGO KOTA ILMU.jpg", order: 1 },
            { institution: "SDS Plus 2 Al-Muhajirin", level: "SD", logo: "assets/SDS 2 AL MUHAJIRIN.jpg", order: 2 },
            { institution: "SMPS Fullday Al-Muhajirin", level: "SMP", logo: "assets/SMPS 2 AL-Muhajirin.png", order: 3 },
            { institution: "SMAN 1 Purwakarta", level: "SMA", logo: "assets/LOGO SMANSA.png", order: 4 }
        ]);

        // 3. Projects (Sample)
        await Project.insertMany([
            { 
                title: "Logo Carya Pandakara", 
                category: "desain-grafis", 
                description: "Desain logo acara untuk Hari Guru 2023 di SMAN 1 Purwakarta.", 
                media: "assets/Design/LOGO CARYA PANDAKARA.png", 
                mediaType: "image",
                order: 1 
            },
            { 
                title: "Logo Porsesa", 
                category: "desain-grafis", 
                description: "Desain logo acara PORSESA dengan tema 'Bersinergi mewujudkan solidaritas'.", 
                media: "assets/Design/LOGO PORSESA 2023.png", 
                mediaType: "image",
                order: 2 
            },
            { 
                title: "Milad Al-Muhajirin", 
                category: "video", 
                description: "Video dokumentasi acara Milad dan Haul Al-Muhajirin", 
                media: "assets/Video/MILAD ALMUHAJIRIN.mp4", 
                mediaType: "video",
                order: 3 
            },
            { 
                title: "Website Kabinet OSIS-BPHPK", 
                category: "website", 
                description: "Merancang Website Kabinet OSIS-BPHPK Periode 24-25 dengan tampilan modern.", 
                media: "assets/Website/Website Kabinet OSIS-BPHPK Periode 24-25.png", 
                mediaType: "image",
                link: "https://osisbphpksmansa.org/",
                order: 4 
            }
        ]);

        // 4. Achievements (Sample)
        await Achievement.insertMany([
            { 
                date: "23 Oktober 2021", 
                title: "Sekbid Dokumentasi OSIS SMPS 2 Al-Muhajirin", 
                description: "Mengabadikan setiap kegiatan OSIS dan sekolah melalui foto maupun video.",
                order: 1 
            },
            { 
                date: "13 September 2022", 
                title: "Wakil Ketua OSIS SMPS 2 Al-Muhajirin", 
                description: "Menjadi teladan bagi teman-teman dan membantu menjalankan berbagai program sekolah.",
                order: 2 
            }
        ]);

        // 5. Skills
        await Skill.insertMany([
            { name: "Canva", icon: "assets/Canva.png", order: 1 },
            { name: "VS Code", icon: "assets/Logo VSC.gif", order: 2 },
            { name: "Lightroom", icon: "assets/Logo Lightroom.jpg", order: 3 },
            { name: "CapCut", icon: "assets/Logo Capcut.jpg", order: 4 },
            { name: "Premiere Pro", icon: "assets/Logo Adobe Premire Pro.jpg", order: 5 }
        ]);

        // 6. Documentation
        await Documentation.insertMany([
            {
                title: "GO Awards 2024",
                date: "9 Juni 2024",
                media: "assets/Dokumentasi/IMG_9727.JPG",
                link: "https://drive.google.com/drive/folders/1VHaWl_IvOabNV7eTSaRTm8fd1bYLgIn_?usp=drive_link",
                order: 1
            }
        ]);

        console.log('Data berhasil dipindahkan ke database!');
        process.exit();
    } catch (err) {
        console.error('Gagal seeding:', err);
        process.exit(1);
    }
};

seedData();
