-- phpMyAdmin SQL Dump
-- version 4.9.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: 03.01.2021 klo 20:27
-- Palvelimen versio: 10.4.11-MariaDB
-- PHP Version: 7.4.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ravintolaskuri`
--

-- --------------------------------------------------------

--
-- Rakenne taululle `kayttaja`
--

CREATE TABLE `kayttaja` (
  `kayttaja_id` int(11) NOT NULL,
  `tunnus` text COLLATE utf8mb4_swedish_ci NOT NULL,
  `salasana` text COLLATE utf8mb4_swedish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_swedish_ci;

-- --------------------------------------------------------

--
-- Rakenne taululle `koira`
--

CREATE TABLE `koira` (
  `id` int(11) NOT NULL,
  `kayttaja_id` int(11) NOT NULL,
  `nimi` text COLLATE utf8mb4_swedish_ci NOT NULL,
  `paino` decimal(11,2) NOT NULL,
  `ika` int(11) NOT NULL,
  `aktiivisuus` text COLLATE utf8mb4_swedish_ci NOT NULL,
  `nivelrikko` tinyint(1) NOT NULL,
  `haimanvajaatoiminta` tinyint(1) NOT NULL,
  `proteiini_tarve` decimal(11,2) NOT NULL,
  `sinkki_tarve` decimal(11,2) NOT NULL,
  `msm_tarve` decimal(11,2) NOT NULL,
  `kondroitiini_tarve` decimal(11,2) NOT NULL,
  `glukosamiini_tarve` decimal(11,2) NOT NULL,
  `raaka_valittu` text COLLATE utf8mb4_swedish_ci NOT NULL,
  `raaka_maara` int(11) NOT NULL,
  `raaka_proteiini` int(11) NOT NULL,
  `kuiva_valittu` text COLLATE utf8mb4_swedish_ci NOT NULL,
  `kuiva_maara` int(11) NOT NULL,
  `kuiva_proteiini` int(11) NOT NULL,
  `kuiva_sinkki` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_swedish_ci;

-- --------------------------------------------------------

--
-- Rakenne taululle `kuivaruoka`
--

CREATE TABLE `kuivaruoka` (
  `kuiva_id` int(11) NOT NULL,
  `tuote` text COLLATE utf8mb4_swedish_ci NOT NULL,
  `g_per_5kg` decimal(11,2) NOT NULL,
  `proteiini` int(11) NOT NULL,
  `rasva` int(11) NOT NULL,
  `kuitu` decimal(11,2) NOT NULL,
  `sinkki` decimal(11,2) NOT NULL,
  `msm` decimal(11,2) NOT NULL,
  `kondroitiini` decimal(11,2) NOT NULL,
  `glukosamiini` decimal(11,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_swedish_ci;

--
-- Vedos taulusta `kuivaruoka`
--

INSERT INTO `kuivaruoka` (`kuiva_id`, `tuote`, `g_per_5kg`, `proteiini`, `rasva`, `kuitu`, `sinkki`, `msm`, `kondroitiini`, `glukosamiini`) VALUES
(1, 'Hau-Hau Champion Lammas-riisi', '90.00', 23, 10, '2.80', '7.30', '0.00', '0.00', '0.00'),
(2, 'James Wellbeloved Senior Kalkkuna & Riisi', '90.00', 19, 9, '3.80', '38.50', '0.00', '0.00', '0.00'),
(3, 'Canagan Light/Senior', '70.00', 33, 14, '3.50', '57.70', '170.00', '120.00', '170.00');

-- --------------------------------------------------------

--
-- Rakenne taululle `raakaruoka`
--

CREATE TABLE `raakaruoka` (
  `raaka_id` int(11) NOT NULL,
  `tuote` text COLLATE utf8mb4_swedish_ci NOT NULL,
  `rasva` int(11) NOT NULL,
  `proteiini` int(11) NOT NULL,
  `sinkki` decimal(11,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_swedish_ci;

--
-- Vedos taulusta `raakaruoka`
--

INSERT INTO `raakaruoka` (`raaka_id`, `tuote`, `rasva`, `proteiini`, `sinkki`) VALUES
(1, 'Sian haima', 13, 18, '0.00'),
(2, 'Broilerjauheliha', 8, 15, '2.70'),
(3, 'Broilerfile', 2, 23, '0.90'),
(4, 'Possun sydänjauheliha', 5, 16, '1.30'),
(5, 'Porojauheliha luulla', 5, 19, '4.80');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `kayttaja`
--
ALTER TABLE `kayttaja`
  ADD PRIMARY KEY (`kayttaja_id`);

--
-- Indexes for table `koira`
--
ALTER TABLE `koira`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `kuivaruoka`
--
ALTER TABLE `kuivaruoka`
  ADD PRIMARY KEY (`kuiva_id`);

--
-- Indexes for table `raakaruoka`
--
ALTER TABLE `raakaruoka`
  ADD PRIMARY KEY (`raaka_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `kayttaja`
--
ALTER TABLE `kayttaja`
  MODIFY `kayttaja_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `koira`
--
ALTER TABLE `koira`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `kuivaruoka`
--
ALTER TABLE `kuivaruoka`
  MODIFY `kuiva_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `raakaruoka`
--
ALTER TABLE `raakaruoka`
  MODIFY `raaka_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
