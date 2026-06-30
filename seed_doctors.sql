USE HealthcareChatbotDB;
GO

DECLARE @maxId INT = ISNULL((SELECT MAX(Id) FROM Doctors), 0);
DBCC CHECKIDENT ('Doctors', RESEED, @maxId);
GO

INSERT INTO Doctors (Name, Specialization, Location, Available) VALUES
('Dr. Alice Smith', 'Cardiologist', 'New York Heart Center', 1),
('Dr. Bob Johnson', 'Dermatologist', 'Skin Health Clinic', 1),
('Dr. Emma Williams', 'Neurologist', 'Neuro Care Institute', 1),
('Dr. John Doe', 'General Physician', 'City Central Clinic', 1),
('Dr. Sarah Miller', 'Pediatrician', 'Kids Care Hospital', 1),
('Dr. Michael Brown', 'Orthopedic', 'Bone & Joint Center', 1),
('Dr. Jessica Davis', 'Psychiatrist', 'Mental Health Associates', 1),
('Dr. David Wilson', 'Oncologist', 'Cancer Treatment Center', 1),
('Dr. Amanda Moore', 'Endocrinologist', 'Diabetes & Thyroid Clinic', 1),
('Dr. Robert Taylor', 'Gastroenterologist', 'Digestive Health Clinic', 1),
('Dr. Olivia Anderson', 'Ophthalmologist', 'Vision Care Center', 1),
('Dr. James Thomas', 'ENT Specialist', 'Eye & Ear Hospital', 1),
('Dr. Steven Strange', 'Infectious Disease Specialist', 'Sanctum Medical Center', 1),
('Dr. Erik Selvig', 'Hepatologist', 'Stellan Medical Labs', 1),
('Dr. Bruce Banner', 'Oncologist', 'Gamma Research Center', 1),
('Dr. Victor Von Doom', 'Dermatologist (Specialist)', 'Latveria Clinical Care', 1),
('Dr. Reed Richards', 'General Physician', 'Future Foundation Health', 1),
('Dr. Jane Foster', 'Infectious Disease Specialist', 'Asgardian Health Services', 1);
GO
