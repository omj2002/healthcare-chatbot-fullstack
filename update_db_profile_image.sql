USE HealthcareChatbotDB;
GO

-- Add ProfileImage column to Users table (for Staff and general users)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'ProfileImage')
BEGIN
    ALTER TABLE Users ADD ProfileImage NVARCHAR(MAX) NULL;
    PRINT 'Added ProfileImage column to Users table.';
END
GO

-- Add ProfileImage column to Doctors table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Doctors') AND name = 'ProfileImage')
BEGIN
    ALTER TABLE Doctors ADD ProfileImage NVARCHAR(MAX) NULL;
    PRINT 'Added ProfileImage column to Doctors table.';
END
GO
