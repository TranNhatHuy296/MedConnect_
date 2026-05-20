mysqldump: [Warning] Using a password on the command line interface can be insecure.
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: medconnect
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `drug_references`
--

DROP TABLE IF EXISTS `drug_references`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drug_references` (
  `id` int NOT NULL AUTO_INCREMENT,
  `drug_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `disease` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `warning` text COLLATE utf8mb4_unicode_ci,
  `contraindications` text COLLATE utf8mb4_unicode_ci COMMENT 'Drugs not to use together',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `drug_code` (`drug_code`),
  UNIQUE KEY `drug_code_2` (`drug_code`),
  UNIQUE KEY `drug_code_3` (`drug_code`),
  UNIQUE KEY `drug_code_4` (`drug_code`),
  UNIQUE KEY `drug_code_5` (`drug_code`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drug_references`
--

LOCK TABLES `drug_references` WRITE;
/*!40000 ALTER TABLE `drug_references` DISABLE KEYS */;
INSERT INTO `drug_references` VALUES (1,'DRUG-001','Valsartan','Huyết áp','Valsartan thuộc nhóm thuốc chẹn thụ thể angiotensin II (ARB), giúp giãn mạch máu và hạ huyết áp. Được chỉ định để điều trị tăng huyết áp, giảm nguy cơ đột quỵ và nhồi máu cơ tim.','Không dùng trong thai kỳ vì có thể gây dị tật thai nhi. Nếu uống quá liều có thể gây tụt huyết áp nghiêm trọng — cần đến cơ sở y tế ngay.','⚠️ Levodopa (Parkinson) | Thuốc chống trầm cảm (SNRI) | Thuốc an thần kinh (chống loạn thần) | Thuốc hạ áp / phì đại tuyến tiền liệt (alpha blocker) | Thuốc bảo vệ cơ quan (dùng trong hoá trị)','2026-04-02 00:36:20','2026-04-02 00:36:20'),(2,'DRUG-002','Ramipril','Tiểu đường','Ramipril là thuốc ức chế men chuyển (ACE inhibitor), giúp hạ huyết áp và bảo vệ tim mạch. Thường dùng cho bệnh nhân tăng huyết áp có kèm tiểu đường hoặc bệnh thận.','Quá liều có thể gây tụt huyết áp, nhịp tim chậm và suy thận. Có thể gây ho khan kéo dài — báo cho bác sĩ nếu gặp tình trạng này.','⚠️ Levodopa (Parkinson) |Thuốc chống trầm cảm (SNRI) |  Thuốc an thần kinh (chống loạn thần) | Thuốc hạ áp / phì đại tuyến tiền liệt (alpha blocker) | Thuốc bảo vệ cơ quan (dùng trong hoá trị)','2026-04-02 00:36:20','2026-04-02 00:36:20'),(3,'DRUG-003','Carbidopa','Parkinson','Carbidopa luôn được dùng kết hợp với Levodopa trong điều trị Parkinson. Nó giúp Levodopa hoạt động hiệu quả hơn và giảm tác dụng phụ buồn nôn.','Không tự ngừng thuốc đột ngột vì có thể gây hội chứng ác tính. Tránh dùng chung với một số thuốc tâm thần vì có thể làm giảm tác dụng.','Thuốc điều trị tụt huyết áp tư thế (Parkinson) | Thuốc kích thần (ADHD) | Thuốc kích thần (ADHD) | Thuốc chống nôn / kích thích tiêu hoá | Thuốc an thần kinh thế hệ 2','2026-04-02 00:36:20','2026-04-02 00:36:20'),(4,'DRUG-004','Glimepiride','Tiểu đường','Glimepiride thuộc nhóm sulfonylurea, kích thích tuyến tụy tiết thêm insulin để hạ đường huyết. Dùng cho bệnh nhân tiểu đường type 2 kết hợp với chế độ ăn và tập thể dục.','Nguy cơ hạ đường huyết cao nếu bỏ bữa hoặc uống rượu. Không nên lái xe hoặc làm việc trên cao khi chưa quen thuốc.','Thuốc trị bệnh to đầu chi (ức chế GH) | Thuốc ức chế miễn dịch (chống thải ghép) | Thuốc kháng sinh (macrolide) | Thuốc hạ huyết áp cũ | Thuốc trị tăng áp phổi','2026-04-02 00:36:20','2026-04-02 00:36:20'),(5,'DRUG-005','Metoprolol','Tiểu đường','Metoprolol là thuốc chẹn beta, làm chậm nhịp tim và hạ huyết áp. Dùng để điều trị tăng huyết áp, đau thắt ngực và suy tim.','Không ngừng thuốc đột ngột vì có thể gây cơn đau thắt ngực hoặc nhồi máu cơ tim. Quá liều gây nhịp tim chậm, tụt huyết áp và khó thở.','⚠️ Levodopa (Parkinson) |Thuốc chống trầm cảm (SNRI) |  Thuốc an thần kinh (chống loạn thần) | Thuốc điều trị ung thư phổi | Thuốc điều trị ung thư máu','2026-04-02 00:36:20','2026-04-02 00:36:20'),(6,'DRUG-006','Ropinirole','Parkinson','Ropinirole là thuốc chủ vận dopamine, giúp bù đắp sự thiếu hụt dopamine trong não ở bệnh nhân Parkinson. Cũng dùng điều trị hội chứng chân không yên.','Quá liều gây kích động, lú lẫn, buồn ngủ và cử động bất thường. Có thể gây buồn ngủ đột ngột — không lái xe khi dùng thuốc này.','⚠️ Levodopa (Parkinson) | Thuốc chống trầm cảm (SNRI) |  Thuốc điều trị viêm khớp (DMARD) | Botox type B - tiêm điều trị co cứng cơ | Botox - tiêm điều trị co cứng cơ','2026-04-02 00:36:20','2026-04-02 00:36:20'),(7,'DRUG-007','Acarbose','Tiểu đường','Acarbose làm chậm quá trình hấp thu đường từ thức ăn vào máu, giúp kiểm soát đường huyết sau bữa ăn. Thuốc uống ngay đầu mỗi bữa ăn chính.','Quá liều chủ yếu gây đầy bụng, tiêu chảy và đau bụng. Không dùng cho bệnh nhân có bệnh ruột mãn tính.','Thuốc trị bệnh to đầu chi (ức chế GH) | Thuốc tim mạch (Digoxin) | Thuốc tim mạch (Digoxin dạng khác) | Thuốc tim mạch (Digoxin dạng khác) | Kháng sinh đường ruột','2026-04-02 00:36:20','2026-04-02 00:36:20'),(8,'DRUG-008','Metformin','Tiểu đường','Metformin là thuốc đầu tay trong điều trị tiểu đường type 2, giúp giảm lượng đường gan sản xuất và tăng nhạy cảm insulin của tế bào. Ít gây hạ đường huyết hơn các thuốc khác.','Nguy cơ nhiễm toan lactic (hiếm nhưng nguy hiểm) khi dùng quá liều hoặc ở bệnh nhân suy thận. Cần uống đủ nước và thông báo cho bác sĩ nếu có buồn nôn, nôn nhiều.','Thuốc trị bệnh to đầu chi (ức chế GH) | Thuốc chống loạn nhịp tim | Thuốc bàng quang / tiêu hoá (kháng cholinergic) | Thuốc trị đau thắt ngực | Thuốc chống động kinh / đau nửa đầu','2026-04-02 00:36:20','2026-04-02 00:36:20'),(9,'DRUG-009','Atenolol','Huyết áp','Atenolol là thuốc chẹn beta tác dụng chọn lọc trên tim, giúp hạ huyết áp và giảm nhịp tim. Dùng để điều trị tăng huyết áp và đau thắt ngực.','Không ngừng thuốc đột ngột. Quá liều gây nhịp tim chậm và tụt huyết áp nghiêm trọng — cần đến bệnh viện ngay.','⚠️ Levodopa (Parkinson) |  Thuốc chống trầm cảm (SNRI) |  Thuốc an thần kinh (chống loạn thần) | Thuốc kháng sinh (macrolide) | Hormone nữ (progesterone)','2026-04-02 00:36:20','2026-04-02 00:36:20'),(10,'DRUG-010','Trihexyphenidyl','Parkinson','Trihexyphenidyl là thuốc kháng cholinergic, giúp giảm run tay và cứng cơ trong bệnh Parkinson. Thường dùng kết hợp với Levodopa.','Quá liều gây giãn đồng tử, khô miệng, bí tiểu và tăng thân nhiệt nguy hiểm. Người cao tuổi đặc biệt nhạy cảm — cần theo dõi sát.','Thuốc COPD (kháng cholinergic hít) | Thuốc chống trầm cảm (NaSSA) | Thuốc bàng quang tăng hoạt | Bổ sung kali (điện giải) | Thuốc hỗ trợ tiểu đường (tiêm)','2026-04-02 00:36:20','2026-04-02 00:36:20'),(11,'DRUG-011','Amlodipine','Huyết áp','Amlodipine là thuốc chẹn kênh canxi, giúp giãn mạch máu và hạ huyết áp. Dùng điều trị tăng huyết áp và đau thắt ngực ổn định.','Quá liều gây tụt huyết áp nặng và nhịp tim nhanh phản xạ. Có thể gây phù mắt cá chân — báo cho bác sĩ nếu gặp tình trạng này.','⚠️ Levodopa (Parkinson) | Thuốc chống trầm cảm (SNRI) |  Thuốc an thần kinh (chống loạn thần) | Thuốc điều trị ung thư phổi | Thuốc điều hoà nhịp tim','2026-04-02 00:36:20','2026-04-02 00:36:20'),(12,'DRUG-012','Pramipexole','Parkinson','Pramipexole là thuốc chủ vận dopamine dùng điều trị triệu chứng Parkinson, đặc biệt hiệu quả với run và cứng cơ. Có thể dùng đơn độc hoặc kết hợp với Levodopa.','Có thể gây buồn ngủ đột ngột không báo trước — không lái xe. Một số bệnh nhân có hành vi bất thường như cờ bạc hoặc ăn uống mất kiểm soát.','⚠️ Levodopa (Parkinson) | Thuốc chống trầm cảm (SNRI) |  Botox type B - tiêm điều trị co cứng cơ | Botox - tiêm điều trị co cứng cơ | Axit amin / hỗ trợ thần kinh','2026-04-02 00:36:20','2026-04-02 00:36:20'),(13,'DRUG-013','Celecoxib','Xương khớp','Celecoxib là thuốc kháng viêm NSAID chọn lọc COX-2, giúp giảm đau và viêm khớp với ít tác dụng phụ dạ dày hơn các NSAID thông thường. Dùng cho viêm khớp dạng thấp và thoái hóa khớp.','Không dùng cho bệnh nhân suy thận hoặc suy gan nặng. Tăng nguy cơ tim mạch nếu dùng lâu dài — cần theo dõi định kỳ.','Thuốc hạ mỡ máu (statin) | Thuốc kháng cholinergic (nhãn khoa / cấp cứu) | Thuốc nhuộm màu dùng trong nhãn khoa | Thuốc cai rượu | Thuốc hạ mỡ máu (ức chế hấp thu cholesterol)','2026-04-02 00:36:20','2026-04-02 00:36:20'),(14,'DRUG-014','Entacapone','Parkinson','Entacapone là thuốc ức chế COMT, dùng kết hợp với Levodopa/Carbidopa để kéo dài tác dụng điều trị Parkinson. Giúp giảm hiện tượng \'wearing-off\' (thuốc hết tác dụng trước giờ uống tiếp theo).','Có thể gây tụt huyết áp tư thế đứng, ảo giác và cử động bất thường. Nước tiểu có thể chuyển màu vàng cam — đây là hiện tượng bình thường.','Thuốc giảm đau opioid / cai nghiện | Thuốc kháng histamine / an thần nhẹ | Cannabinoid tổng hợp (chống nôn / kích thích ăn) | Thuốc an thần kinh (tiêm bệnh viện) | Thuốc giảm đau opioid','2026-04-02 00:36:20','2026-04-02 00:36:20'),(15,'DRUG-015','Enalapril','Huyết áp','Enalapril là thuốc ức chế men chuyển (ACE inhibitor), giúp hạ huyết áp và bảo vệ tim. Dùng điều trị tăng huyết áp và suy tim sung huyết.','Quá liều gây tụt huyết áp nghiêm trọng. Có thể gây phù mạch (sưng mặt, môi, lưỡi) — đây là trường hợp khẩn cấp, cần đến bệnh viện ngay.','⚠ Levodopa (Parkinson) | Thuốc chống trầm cảm (SNRI) |  Thuốc an thần kinh (chống loạn thần) | Thuốc hạ áp / phì đại tuyến tiền liệt (alpha blocker) | Thuốc bảo vệ cơ quan (dùng trong hoá trị)','2026-04-02 00:36:20','2026-04-02 00:36:20'),(16,'DRUG-016','Diclofenac','Xương khớp','Diclofenac là thuốc kháng viêm giảm đau NSAID, dùng để điều trị đau và viêm trong các bệnh viêm khớp, thoái hóa khớp và đau cơ xương khớp.','Quá liều gây đau bụng, buồn nôn, nôn và chảy máu tiêu hóa. Không dùng chung với rượu hoặc các NSAID khác.','Thuốc hạ huyết áp cũ | Hormone nữ (progesterone) | Thuốc an thần kinh cũ (phenothiazine) | Thuốc kháng H2 (dạ dày) | Thuốc trị tăng áp phổi','2026-04-02 00:36:20','2026-04-02 00:36:20'),(17,'DRUG-017','Bisoprolol','Huyết áp','Bisoprolol là thuốc chẹn beta chọn lọc tim, giúp hạ huyết áp, giảm nhịp tim và bảo vệ cơ tim. Dùng điều trị tăng huyết áp nhẹ đến vừa.','Không ngừng đột ngột. Quá liều gây nhịp chậm, tụt huyết áp và co thắt phế quản — nguy hiểm cho người hen suyễn.','⚠ Levodopa (Parkinson) | Thuốc chống trầm cảm (SNRI) |  Thuốc an thần kinh (chống loạn thần) | Thuốc trị đau thắt ngực | Thuốc điều trị ung thư phổi','2026-04-02 00:36:20','2026-04-02 00:36:20'),(18,'DRUG-018','Galantamine','Alzheimer','Galantamine là thuốc ức chế cholinesterase, giúp duy trì mức acetylcholine trong não, làm chậm suy giảm nhận thức ở bệnh nhân Alzheimer mức độ nhẹ đến vừa.','Quá liều gây buồn nôn, nôn, tiêu chảy và nhịp tim chậm. Cần tăng liều từ từ theo hướng dẫn của bác sĩ.','Thuốc điều trị ung thư phổi | Thuốc điều hoà nhịp tim | Thuốc điều trị ung thư máu | Thuốc chống kết tập tiểu cầu | Thuốc giao cảm (tăng huyết áp, giãn phế quản)','2026-04-02 00:36:20','2026-04-02 00:36:20'),(19,'DRUG-019','Losartan','Tiểu đường','Losartan là thuốc chẹn thụ thể angiotensin II (ARB), giúp hạ huyết áp và bảo vệ thận. Đặc biệt phù hợp cho bệnh nhân tiểu đường type 2 có biến chứng thận hoặc có nguy cơ đột quỵ.','Không dùng trong thai kỳ. Tránh dùng chung với thuốc lợi tiểu giữ kali vì có thể tăng kali máu nguy hiểm.','⚠ Levodopa (Parkinson) | Thuốc chống trầm cảm (SNRI) |  Thuốc an thần kinh (chống loạn thần) | Thuốc hạ huyết áp cũ | Hormone nữ (progesterone)','2026-04-02 00:36:20','2026-04-02 00:36:20'),(20,'DRUG-020','Lisinopril','Huyết áp','Lisinopril là thuốc ức chế men chuyển (ACE inhibitor) dùng điều trị tăng huyết áp, suy tim và bảo vệ thận ở bệnh nhân tiểu đường.','Có thể gây ho khan và phù mạch. Không dùng cho phụ nữ mang thai. Quá liều gây tụt huyết áp nặng.','⚠️ Levodopa (Parkinson) | Thuốc chống trầm cảm (SNRI) | Thuốc an thần kinh (chống loạn thần) | Thuốc hạ áp / phì đại tuyến tiền liệt (alpha blocker) | Thuốc bảo vệ cơ quan (dùng trong hoá trị)','2026-04-02 00:36:20','2026-04-02 00:36:20'),(21,'DRUG-021','Naproxen','Xương khớp','Naproxen là thuốc kháng viêm giảm đau NSAID, dùng để điều trị viêm khớp dạng thấp, thoái hóa khớp, viêm cột sống dính khớp và các cơn đau cấp.','Dễ quá liều do bán không cần đơn — cần tuân thủ liều chỉ định. Có thể gây loét và chảy máu dạ dày, đặc biệt ở người cao tuổi.','Thuốc kháng sinh (macrolide) | Thuốc hạ huyết áp cũ | Hormone nữ (progesterone) | Thuốc an thần kinh cũ (phenothiazine) | Thuốc kháng H2 (dạ dày)','2026-04-02 00:36:20','2026-04-02 00:36:20'),(22,'DRUG-022','Perindopril','Huyết áp','Perindopril là thuốc ức chế men chuyển (ACE inhibitor), dùng điều trị tăng huyết áp, suy tim và giảm nguy cơ tim mạch ở bệnh nhân bệnh mạch vành ổn định.','Tác dụng phụ thường gặp là ho khan. Quá liều gây tụt huyết áp nặng — biểu hiện chóng mặt khi đứng dậy.','⚠️ Levodopa (Parkinson) | Thuốc chống trầm cảm (SNRI) |  Thuốc an thần kinh (chống loạn thần) | Thuốc hạ áp / phì đại tuyến tiền liệt (alpha blocker) | Thuốc bảo vệ cơ quan (dùng trong hoá trị)','2026-04-02 00:36:20','2026-04-02 00:36:20'),(23,'DRUG-023','Sulfasalazine','Xương khớp','Sulfasalazine là thuốc kháng viêm và điều hòa miễn dịch (DMARD), dùng để điều trị viêm khớp dạng thấp và viêm loét đại tràng.','Cần xét nghiệm máu định kỳ khi dùng lâu dài. Có thể gây dị ứng ở người dị ứng sulfa.','Thuốc chống loãng xương (tiêm) | Thuốc interferon (viêm gan / miễn dịch) | Thuốc interferon (viêm gan / miễn dịch) | Thuốc interferon (viêm gan / miễn dịch) | Thuốc interferon (viêm gan / miễn dịch)','2026-04-02 00:36:20','2026-04-02 00:36:20'),(24,'DRUG-024','Candesartan cilexetil','Huyết áp','Candesartan là thuốc chẹn thụ thể angiotensin II (ARB), hiệu quả trong điều trị tăng huyết áp và suy tim. Thường dùng cho bệnh nhân không dung nạp được thuốc ACE inhibitor.','Không dùng trong thai kỳ. Cần theo dõi chức năng thận và nồng độ kali máu định kỳ.','⚠️ Levodopa (Parkinson) | Thuốc chống trầm cảm (SNRI) | Thuốc an thần kinh (chống loạn thần) | Thuốc hạ áp / phì đại tuyến tiền liệt (alpha blocker) | Thuốc hạ huyết áp (ức chế renin)','2026-04-02 00:36:20','2026-04-02 00:36:20'),(25,'DRUG-025','Indapamide','Huyết áp','Indapamide là thuốc lợi tiểu thiazide-like, giúp thải bớt muối và nước qua nước tiểu để hạ huyết áp. Dùng đơn độc hoặc kết hợp với thuốc hạ áp khác.','Quá liều gây buồn nôn, mất cân bằng điện giải (kali, natri) và yếu cơ. Cần uống đủ nước và kiểm tra điện giải định kỳ.','⚠️ Levodopa (Parkinson) | Thuốc chống trầm cảm (SNRI) | Thuốc an thần kinh (chống loạn thần) | Thuốc hạ áp / phì đại tuyến tiền liệt (alpha blocker) | Thuốc bảo vệ cơ quan (dùng trong hoá trị)','2026-04-02 00:36:20','2026-04-02 00:36:20'),(26,'DRUG-026','Meloxicam','Xương khớp','Meloxicam là thuốc kháng viêm NSAID chọn lọc COX-2 tương đối, dùng để giảm đau và viêm trong thoái hóa khớp và viêm khớp dạng thấp. Ít gây kích ứng dạ dày hơn ibuprofen.','Quá liều gây khó thở, co giật và giảm lượng nước tiểu. Không dùng cho bệnh nhân suy thận hoặc suy tim nặng.','⚠ Amlodipine (Huyết áp) | Thuốc tăng huyết áp tư thế | Thuốc giãn phế quản cũ | Thuốc trị đau nửa đầu (triptan) | Thuốc vận mạch (bệnh viện)','2026-04-02 00:36:20','2026-04-02 00:36:20'),(27,'DRUG-027','Donepezil','Alzheimer','Donepezil là thuốc ức chế cholinesterase phổ biến nhất trong điều trị Alzheimer, giúp duy trì trí nhớ và khả năng nhận thức ở mức độ nhẹ đến nặng. Uống 1 lần/ngày, thường vào buổi tối.','Quá liều gây buồn nôn, nôn, tiêu chảy và nhịp tim chậm. Tăng liều cần thực hiện từ từ theo hướng dẫn bác sĩ.','Thuốc điều trị ung thư phổi | Thuốc điều hoà nhịp tim | Thuốc điều trị ung thư máu | Thuốc giảm đau opioid / cai nghiện | Thuốc kháng histamine / an thần nhẹ','2026-04-02 00:36:20','2026-04-02 00:36:20'),(28,'DRUG-028','Amantadine','Parkinson','Amantadine ban đầu là thuốc kháng virus, sau được phát hiện có tác dụng cải thiện triệu chứng Parkinson. Giúp giảm run, cứng cơ và cải thiện khả năng vận động.','Liều tối thiểu gây tử vong được báo cáo là 2 gram — cần bảo quản xa tầm tay trẻ em. Quá liều gây rối loạn nhịp tim và co giật.','Hormone tiêu hoá (kiểm tra chức năng tụy) | Thuốc kích thần (ADHD) | Thuốc kích thần (ADHD) | Thuốc chống nôn / kích thích tiêu hoá | Thuốc chống trầm cảm / bỏ thuốc lá','2026-04-02 00:36:20','2026-04-02 00:36:20'),(29,'DRUG-029','Telmisartan','Tiểu đường','Telmisartan là thuốc chẹn ARB tác dụng kéo dài, dùng điều trị tăng huyết áp và giảm nguy cơ tim mạch. Phù hợp cho bệnh nhân tiểu đường có tăng huyết áp đi kèm.','Không dùng trong thai kỳ. Quá liều gây tụt huyết áp và nhịp tim nhanh. Độc tính đường uống thấp.','⚠ Levodopa (Parkinson) | Thuốc chống trầm cảm (SNRI) | Thuốc an thần kinh (chống loạn thần) | Thuốc tiểu đường cũ (đã rút khỏi thị trường) | Thuốc hạ huyết áp cũ','2026-04-02 00:36:20','2026-04-02 00:36:20'),(30,'DRUG-030','Rivastigmine','Alzheimer','Rivastigmine là thuốc ức chế cholinesterase dùng điều trị sa sút trí tuệ nhẹ đến vừa do Alzheimer hoặc Parkinson. Có dạng miếng dán da và viên uống.','Không có dữ liệu cảnh báo đặc biệt, nhưng cần tuân thủ liều và theo dõi tác dụng phụ tiêu hóa như buồn nôn, nôn.','Thuốc điều trị ung thư phổi | Thuốc điều hoà nhịp tim | Thuốc điều trị ung thư máu | Thuốc chẹn beta (tiêm tĩnh mạch) | Thuốc hạ huyết áp / nhỏ mắt (beta blocker)','2026-04-02 00:36:20','2026-04-02 00:36:20'),(31,'DRUG-031','Hydrochlorothiazide','Huyết áp','Hydrochlorothiazide là thuốc lợi tiểu thiazide kinh điển, giúp hạ huyết áp bằng cách giảm lượng muối và nước trong cơ thể. Thường dùng kết hợp với các thuốc hạ áp khác.','Quá liều gây mất kali, hạ natri máu và yếu cơ. Cần kiểm tra điện giải máu định kỳ, đặc biệt ở người cao tuổi.','⚠ Levodopa (Parkinson) | Thuốc chống trầm cảm (SNRI) | Thuốc an thần kinh (chống loạn thần) | Thuốc hạ áp / phì đại tuyến tiền liệt (alpha blocker) | Thuốc bảo vệ cơ quan (dùng trong hoá trị)','2026-04-02 00:36:20','2026-04-02 00:36:20'),(32,'DRUG-032','Selegiline','Alzheimer','Selegiline là thuốc ức chế MAO-B, giúp bảo tồn dopamine trong não. Dùng điều trị Parkinson giai đoạn đầu hoặc kết hợp với Levodopa, cũng được nghiên cứu cho Alzheimer.','Tuyệt đối không dùng chung với thuốc chống trầm cảm nhóm SSRI/SNRI vì có thể gây hội chứng serotonin nguy hiểm tính mạng.','Thuốc an thần kinh (chống loạn thần) | Thuốc thải sắt | Thuốc interferon (viêm gan / miễn dịch) | Thuốc điều trị viêm khớp (DMARD) | Thuốc điều trị đa xơ cứng','2026-04-02 00:36:20','2026-04-02 00:36:20'),(33,'DRUG-033','Memantine','Alzheimer','Memantine là thuốc đối kháng thụ thể NMDA, dùng điều trị Alzheimer mức độ vừa đến nặng. Cơ chế khác hoàn toàn với donepezil nên có thể dùng kết hợp.','Không có bằng chứng gây ung thư hay ảnh hưởng sinh sản. Dùng quá liều có thể gây lú lẫn và kích động — cần theo dõi.','Thuốc chống kết tập tiểu cầu / tuần hoàn | Thuốc kích thần (ADHD) | Thuốc kích thần (ADHD) | Thuốc chống nôn / kích thích tiêu hoá | Thuốc lợi tiểu / nhãn khoa','2026-04-02 00:36:20','2026-04-02 00:36:20'),(34,'DRUG-034','Ibuprofen','Xương khớp','Ibuprofen là thuốc kháng viêm giảm đau NSAID phổ biến nhất, dùng giảm đau, hạ sốt và kháng viêm trong viêm khớp và các cơn đau cấp.','Quá liều (>99mg/kg) gây đau bụng, buồn nôn và xuất huyết tiêu hóa. Người cao tuổi cần dùng liều thấp nhất có hiệu quả và không quá 5-7 ngày liên tục.','⚠ Amlodipine (Huyết áp) | Thuốc tăng huyết áp tư thế | Thuốc giãn phế quản cũ | Thuốc trị đau nửa đầu (triptan) | Thuốc vận mạch (bệnh viện)','2026-04-02 00:36:20','2026-04-02 00:36:20'),(35,'DRUG-035','Glipizide','Tiểu đường','Glipizide thuộc nhóm sulfonylurea, kích thích tụy tiết insulin để kiểm soát đường huyết sau bữa ăn. Uống 30 phút trước bữa ăn chính.','Nguy cơ hạ đường huyết nặng nếu bỏ bữa hoặc ăn ít hơn thường ngày. Người cao tuổi và bệnh nhân suy thận cần giảm liều.','Thuốc trị bệnh to đầu chi (ức chế GH) | Thuốc kháng sinh (macrolide) | Thuốc hạ huyết áp cũ | Thuốc trị tăng áp phổi | Thuốc tiểu đường nhóm sulfonylurea','2026-04-02 00:36:20','2026-04-02 00:36:20'),(36,'DRUG-036','Nifedipine','Huyết áp','Nifedipine là thuốc chẹn kênh canxi nhóm dihydropyridine, giúp giãn mạch và hạ huyết áp. Dạng phóng thích kéo dài (XL/GITS) dùng điều trị tăng huyết áp mãn tính.','Quá liều gây tụt huyết áp nặng, nhịp tim chậm và phù phổi. Không được nhai hoặc bẻ viên phóng thích kéo dài.','⚠️ Levodopa (Parkinson) | Thuốc chống trầm cảm (SNRI) | Thuốc an thần kinh (chống loạn thần) | Thuốc hạ huyết áp (ARB) | Thuốc kháng sinh đường tiết niệu','2026-04-02 00:36:20','2026-04-02 00:36:20'),(37,'DRUG-037','Pioglitazone','Tiểu đường','Pioglitazone thuộc nhóm thiazolidinedione, tăng độ nhạy cảm insulin ở mô cơ và mỡ, giúp kiểm soát đường huyết dài hạn trong tiểu đường type 2.','Có thể gây giữ nước và tăng cân — không dùng cho bệnh nhân suy tim. Dùng kéo dài liên quan đến nguy cơ loãng xương và ung thư bàng quang.','Thuốc trị bệnh to đầu chi (ức chế GH) | Insulin (tiêm - điều trị tiểu đường) | Insulin tác dụng nhanh (tiêm) | Insulin tác dụng kéo dài (tiêm) | Insulin nguồn gốc lợn (tiêm)','2026-04-02 00:36:20','2026-04-02 00:36:20'),(38,'DRUG-038','Levodopa','Parkinson','Levodopa là thuốc nền tảng trong điều trị Parkinson, được chuyển hóa thành dopamine trong não để bù đắp sự thiếu hụt. Luôn dùng kết hợp với Carbidopa để tăng hiệu quả.','Không dùng trong thai kỳ vì có thể gây dị tật. Tương tác với nhiều thuốc — bác sĩ cần xem xét toàn bộ đơn thuốc trước khi kê.','⚠️ Valsartan (Huyết áp) | ⚠️ [TRONG DATA] Ramipril (Tiểu đường) |  Thuốc chống trầm cảm (SNRI) | Thuốc miễn dịch trị ung thư | Thuốc tiêu huyết khối (bệnh viện) ','2026-04-02 00:36:20','2026-04-02 00:36:20'),(39,'DRUG-039','Sitagliptin','Tiểu đường','Sitagliptin là thuốc ức chế DPP-4, giúp tăng tiết insulin tự nhiên sau bữa ăn và giảm glucagon. Ít gây hạ đường huyết và không tăng cân.','Dùng trong thai kỳ chưa được chứng minh an toàn hoàn toàn. Hiếm gặp viêm tụy — ngừng thuốc ngay nếu đau bụng dữ dội.','Thuốc trị bệnh to đầu chi (ức chế GH) | Thuốc trị đau thắt ngực | Thuốc nội tiết (kháng progesterone) | Chất tạo ngọt nhân tạo | Chất kiểm tra chức năng thận','2026-04-02 00:36:20','2026-04-02 00:36:20'),(40,'DRUG-040','Rasagiline','Parkinson','Rasagiline là thuốc ức chế MAO-B thế hệ mới, dùng điều trị Parkinson giai đoạn đầu hoặc kết hợp với Levodopa. Dùng 1 lần/ngày, tiện lợi hơn Selegiline.','Quá liều gây chóng mặt, kích thích và tăng huyết áp. Tuyệt đối không dùng chung với thuốc chống trầm cảm SSRI/SNRI.','⚠ Levodopa (Parkinson) | Thuốc an thần kinh (chống loạn thần) | Thuốc thải sắt | Thuốc interferon (viêm gan / miễn dịch) | Thuốc điều trị viêm khớp (DMARD)','2026-04-02 00:36:20','2026-04-02 00:36:20'),(41,'DRUG-041','Hydroxychloroquine','Xương khớp','Hydroxychloroquine là thuốc kháng sốt rét và điều hòa miễn dịch (DMARD), dùng điều trị viêm khớp dạng thấp và lupus ban đỏ hệ thống.','Quá liều gây rối loạn nhịp tim và co giật nguy hiểm. Dùng lâu dài có thể ảnh hưởng thị lực — cần khám mắt định kỳ mỗi 6-12 tháng.','Thuốc chống loãng xương (tiêm) | Thuốc interferon (viêm gan / miễn dịch) | Thuốc interferon (viêm gan / miễn dịch) | Thuốc interferon (viêm gan / miễn dịch) | Thuốc interferon (viêm gan / miễn dịch)','2026-04-02 00:36:20','2026-04-02 00:36:20'),(42,'DRUG-042','Dapagliflozin','Tiểu đường','Dapagliflozin thuộc nhóm SGLT2 inhibitor, giúp thải đường qua nước tiểu để hạ đường huyết. Đồng thời có lợi cho tim và thận ở bệnh nhân tiểu đường type 2.','Tăng nguy cơ nhiễm trùng đường tiết niệu và vùng kín. Người cao tuổi cần theo dõi chức năng thận thường xuyên hơn.','⚠️ Levodopa (Parkinson) | Thuốc trị bệnh to đầu chi (ức chế GH) | Thuốc chống trầm cảm (SNRI) |  Thuốc an thần kinh (chống loạn thần) | Thuốc thải sắt','2026-04-02 00:36:20','2026-04-02 00:36:20'),(43,'DRUG-043','Empagliflozin','Tiểu đường','Empagliflozin là thuốc SGLT2 inhibitor, giúp hạ đường huyết, giảm cân và bảo vệ tim thận. Được chứng minh giảm tử vong tim mạch ở bệnh nhân tiểu đường có bệnh tim.','Kinh nghiệm quá liều còn hạn chế — xử trí theo triệu chứng. Nguy cơ nhiễm trùng đường tiết niệu và mất nước ở người cao tuổi.','⚠️ Levodopa (Parkinson) | ⚠️ Ramipril (Tiểu đường) |Thuốc trị bệnh to đầu chi (ức chế GH) | Thuốc chống trầm cảm (SNRI) | Thuốc an thần kinh (chống loạn thần) ','2026-04-02 00:36:20','2026-04-02 00:36:20');
/*!40000 ALTER TABLE `drug_references` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medication_logs`
--

DROP TABLE IF EXISTS `medication_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medication_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `medicine_schedule_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `scheduled_date` date NOT NULL,
  `scheduled_time` time NOT NULL,
  `status` enum('pending','taken','missed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `taken_at` datetime DEFAULT NULL,
  `confirmed_by` enum('patient','app') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `medicine_schedule_id` (`medicine_schedule_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `medication_logs_ibfk_10` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `medication_logs_ibfk_9` FOREIGN KEY (`medicine_schedule_id`) REFERENCES `medicine_schedules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Dumping data for table `medication_logs`
--

LOCK TABLES `medication_logs` WRITE;
/*!40000 ALTER TABLE `medication_logs` DISABLE KEYS */;
INSERT INTO `medication_logs` VALUES (1,1,1,'2026-04-02','08:00:00','taken','2026-04-02 00:36:20','app','2026-04-02 00:36:20','2026-04-02 00:36:20'),(2,2,1,'2026-04-02','20:00:00','taken','2026-04-02 00:37:07','patient','2026-04-02 00:36:20','2026-04-02 00:37:07'),(3,3,1,'2026-04-02','07:30:00','taken','2026-04-02 00:36:20','app','2026-04-02 00:36:20','2026-04-02 00:36:20'),(4,4,1,'2026-04-02','08:00:00','taken','2026-04-02 00:36:20','app','2026-04-02 00:36:20','2026-04-02 00:36:20'),(5,5,2,'2026-04-02','07:00:00','missed',NULL,NULL,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(6,6,2,'2026-04-02','07:00:00','missed',NULL,NULL,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(7,7,3,'2026-04-02','07:00:00','taken','2026-04-02 00:36:20','app','2026-04-02 00:36:20','2026-04-02 00:36:20'),(8,8,3,'2026-04-02','13:00:00','pending',NULL,NULL,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(9,9,3,'2026-04-02','19:00:00','pending',NULL,NULL,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(10,10,3,'2026-04-02','07:00:00','taken','2026-04-02 00:36:20','app','2026-04-02 00:36:20','2026-04-02 00:36:20'),(11,11,3,'2026-04-02','13:00:00','pending',NULL,NULL,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(12,12,3,'2026-04-02','19:00:00','pending',NULL,NULL,'2026-04-02 00:36:20','2026-04-02 00:36:20');
/*!40000 ALTER TABLE `medication_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicine_schedules`
--

DROP TABLE IF EXISTS `medicine_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicine_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `medicine_id` int NOT NULL,
  `time` time NOT NULL,
  `label` enum('morning','noon','afternoon','evening') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `medicine_schedules_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicine_schedules`
--

LOCK TABLES `medicine_schedules` WRITE;
/*!40000 ALTER TABLE `medicine_schedules` DISABLE KEYS */;
INSERT INTO `medicine_schedules` VALUES (1,1,'08:00:00','morning','2026-04-02 00:36:20','2026-04-02 00:36:20'),(2,1,'20:00:00','evening','2026-04-02 00:36:20','2026-04-02 00:36:20'),(3,2,'07:30:00','morning','2026-04-02 00:36:20','2026-04-02 00:36:20'),(4,3,'08:00:00','morning','2026-04-02 00:36:20','2026-04-02 00:36:20'),(5,4,'07:00:00','morning','2026-04-02 00:36:20','2026-04-02 00:36:20'),(6,5,'07:00:00','morning','2026-04-02 00:36:20','2026-04-02 00:36:20'),(7,6,'07:00:00','morning','2026-04-02 00:36:20','2026-04-02 00:36:20'),(8,6,'13:00:00','noon','2026-04-02 00:36:20','2026-04-02 00:36:20'),(9,6,'19:00:00','evening','2026-04-02 00:36:20','2026-04-02 00:36:20'),(10,7,'07:00:00','morning','2026-04-02 00:36:20','2026-04-02 00:36:20'),(11,7,'13:00:00','noon','2026-04-02 00:36:20','2026-04-02 00:36:20'),(12,7,'19:00:00','evening','2026-04-02 00:36:20','2026-04-02 00:36:20'),(13,8,'08:00:00','morning','2026-04-02 00:36:20','2026-04-02 00:36:20'),(14,9,'21:00:00','evening','2026-04-02 00:36:20','2026-04-02 00:36:20'),(15,10,'08:00:00','morning','2026-04-02 00:36:20','2026-04-02 00:36:20'),(16,10,'20:00:00','evening','2026-04-02 00:36:20','2026-04-02 00:36:20'),(17,11,'12:00:00','noon','2026-04-02 00:36:20','2026-04-02 00:36:20'),(18,12,'08:00:00','morning','2026-04-02 01:38:19','2026-04-02 01:38:19'),(19,12,'12:00:00','afternoon','2026-04-02 01:38:19','2026-04-02 01:38:19'),(20,13,'08:00:00','morning','2026-04-02 01:38:19','2026-04-02 01:38:19'),(21,14,'08:00:00','morning','2026-04-02 01:38:40','2026-04-02 01:38:40'),(22,14,'12:00:00','afternoon','2026-04-02 01:38:40','2026-04-02 01:38:40'),(23,15,'08:00:00','morning','2026-04-02 01:38:40','2026-04-02 01:38:40');
/*!40000 ALTER TABLE `medicine_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicines`
--

DROP TABLE IF EXISTS `medicines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prescription_id` int NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dosage` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `frequency` int NOT NULL COMMENT 'Number of times per day',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `prescription_id` (`prescription_id`),
  CONSTRAINT `medicines_ibfk_1` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicines`
--

LOCK TABLES `medicines` WRITE;
/*!40000 ALTER TABLE `medicines` DISABLE KEYS */;
INSERT INTO `medicines` VALUES (1,1,'Metformin','500','mg',2,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(2,1,'Glipizide','5','mg',1,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(3,1,'Amlodipine','5','mg',1,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(4,2,'Valsartan','80','mg',1,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(5,2,'Bisoprolol','5','mg',1,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(6,3,'Levodopa','250','mg',3,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(7,3,'Carbidopa','25','mg',3,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(8,4,'Sitagliptin','100','mg',1,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(9,5,'Donepezil','5','mg',1,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(10,6,'Hydroxychloroquine','200','mg',2,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(11,6,'Celecoxib','200','mg',1,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(12,7,'Acarbose','12','vien',2,'2026-04-02 01:38:19','2026-04-02 01:38:19'),(13,7,'Diclofenac','33','vien',1,'2026-04-02 01:38:19','2026-04-02 01:38:19'),(14,8,'Amantadine','12','vien',2,'2026-04-02 01:38:40','2026-04-02 01:38:40'),(15,8,'Dapagliflozin','12','vien',1,'2026-04-02 01:38:40','2026-04-02 01:38:40');
/*!40000 ALTER TABLE `medicines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` enum('reminder','confirmation','missed','expiring','updated','channel_error') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` enum('email','in_app') COLLATE utf8mb4_unicode_ci DEFAULT 'in_app',
  `send_status` enum('sent','failed','pending') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `is_read` tinyint(1) DEFAULT '0',
  `prescription_id` int DEFAULT NULL,
  `medicine_id` int DEFAULT NULL,
  `patient_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `prescription_id` (`prescription_id`),
  CONSTRAINT `notifications_ibfk_10` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `notifications_ibfk_9` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,'missed','Bệnh nhân bỏ lỡ thuốc','Trần Văn Bình đã bỏ lỡ liều Valsartan 80mg lúc 07:00 sáng nay.','in_app','sent',0,2,NULL,2,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(2,1,'confirmation','Xác nhận uống thuốc','Nguyễn Thị Hoa đã xác nhận uống Metformin 500mg lúc 08:00.','in_app','sent',0,1,NULL,1,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(3,1,'expiring','Đơn thuốc sắp hết hạn','Đơn thuốc của Nguyễn Thị Hoa sẽ hết hạn vào 15/04/2026. Vui lòng xem xét gia hạn.','in_app','sent',1,1,NULL,1,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(4,3,'reminder','Nhắc uống thuốc','Đến giờ uống Metformin 500mg (1 viên). Uống sau bữa ăn tối.','email','sent',0,1,NULL,NULL,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(5,3,'updated','Đơn thuốc được cập nhật','Bác sĩ Trần Minh Khoa đã cập nhật đơn thuốc của bạn. Vui lòng kiểm tra lại lịch uống.','in_app','sent',1,1,NULL,NULL,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(6,1,'confirmation','Xác nhận uống thuốc: Metformin','Bệnh nhân Nguyễn Thị Hoa đã xác nhận uống Metformin (500 mg) lúc 07:37:07 2/4/2026.','in_app','sent',0,1,1,1,'2026-04-02 00:37:07','2026-04-02 00:37:07'),(7,3,'reminder','Nhắc uống thuốc: Metformin','Đến giờ uống Metformin (500 mg) lúc 08:00','in_app','sent',0,1,1,1,'2026-04-02 00:45:00','2026-04-02 00:45:00'),(8,3,'reminder','Nhắc uống thuốc: Metformin','Đến giờ uống Metformin (500 mg) lúc 08:00','email','sent',0,1,1,1,'2026-04-02 00:45:00','2026-04-02 00:45:00'),(9,3,'reminder','Nhắc uống thuốc: Amlodipine','Đến giờ uống Amlodipine (5 mg) lúc 08:00','in_app','sent',0,1,3,1,'2026-04-02 00:45:00','2026-04-02 00:45:00'),(10,3,'reminder','Nhắc uống thuốc: Amlodipine','Đến giờ uống Amlodipine (5 mg) lúc 08:00','email','sent',0,1,3,1,'2026-04-02 00:45:01','2026-04-02 00:45:01'),(11,3,'reminder','Nhắc uống thuốc: Metformin','Đến giờ uống Metformin (500 mg) lúc 08:00','in_app','sent',0,1,1,1,'2026-04-02 01:00:00','2026-04-02 01:00:00'),(12,3,'reminder','Nhắc uống thuốc: Metformin','Đến giờ uống Metformin (500 mg) lúc 08:00','email','sent',0,1,1,1,'2026-04-02 01:00:00','2026-04-02 01:00:00'),(13,3,'reminder','Nhắc uống thuốc: Amlodipine','Đến giờ uống Amlodipine (5 mg) lúc 08:00','in_app','sent',0,1,3,1,'2026-04-02 01:00:00','2026-04-02 01:00:00'),(14,3,'reminder','Nhắc uống thuốc: Amlodipine','Đến giờ uống Amlodipine (5 mg) lúc 08:00','email','sent',0,1,3,1,'2026-04-02 01:00:01','2026-04-02 01:00:01');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `diagnosis` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `patients_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (1,1,3,'Nguyễn Thị Hoa','1968-03-15','female','0912345678','123 Nguyễn Huệ, Q.1, TP.HCM','Tiểu đường type 2, Huyết áp cao','Bệnh nhân cần theo dõi đường huyết và huyết áp hàng ngày','2026-04-02 00:36:20','2026-04-02 00:36:20',NULL),(2,1,4,'Trần Văn Bình','1954-07-22','male','0923456789','456 Lê Lợi, Q.3, TP.HCM','Huyết áp cao, Gout mãn tính','Bệnh nhân lớn tuổi, cần theo dõi sát chức năng thận','2026-04-02 00:36:20','2026-04-02 00:36:20',NULL),(3,1,5,'Lê Minh Tuấn','1981-11-05','male','0934567890','789 Võ Văn Tần, Q.3, TP.HCM','Parkinson giai đoạn đầu','Cần theo dõi tác dụng phụ buồn ngủ','2026-04-02 00:36:20','2026-04-02 00:36:20',NULL),(4,1,NULL,'Phạm Thị Lan','1961-05-18','female','0945678901','321 Hai Bà Trưng, Q.1, TP.HCM','Tiểu đường type 2','Đang kiểm soát tốt, tái khám mỗi tháng','2026-04-02 00:36:20','2026-04-02 00:36:20',NULL),(5,1,NULL,'Hoàng Văn Nam','1973-09-30','male','0956789012','654 Điện Biên Phủ, Bình Thạnh, TP.HCM','Alzheimer giai đoạn nhẹ','Người thân cần giám sát uống thuốc','2026-04-02 00:36:20','2026-04-02 00:36:20',NULL),(6,2,NULL,'Vũ Thị Mai','1988-12-25','female','0967890123','987 Cách Mạng Tháng 8, Q.10, TP.HCM','Viêm khớp dạng thấp','Cần xét nghiệm máu định kỳ','2026-04-02 00:36:20','2026-04-02 00:36:20',NULL),(7,1,6,'hung','2026-04-02','male','0337163992','gialai','tt',NULL,'2026-04-02 01:19:18','2026-04-02 01:19:18',NULL);
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescriptions`
--

DROP TABLE IF EXISTS `prescriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('active','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `notification_email` tinyint(1) DEFAULT '1',
  `notify_minutes_before` int DEFAULT '15',
  `max_reminders` int DEFAULT '3',
  `notify_doctor_on_confirm` tinyint(1) DEFAULT '1',
  `notify_doctor_on_miss` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `prescriptions_ibfk_10` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `prescriptions_ibfk_9` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescriptions`
--

LOCK TABLES `prescriptions` WRITE;
/*!40000 ALTER TABLE `prescriptions` DISABLE KEYS */;
INSERT INTO `prescriptions` VALUES (1,1,1,'2026-03-15','2026-04-15','active','Kiểm soát đường huyết và huyết áp. Tái khám sau 1 tháng.',1,15,3,1,1,'2026-04-02 00:36:20','2026-04-02 00:36:20',NULL),(2,1,2,'2026-03-20','2026-04-20','active','Theo dõi huyết áp mỗi ngày. Hạn chế muối.',1,10,2,1,1,'2026-04-02 00:36:20','2026-04-02 00:36:20',NULL),(3,1,3,'2026-03-10','2026-06-10','active','Parkinson giai đoạn đầu. Theo dõi tác dụng phụ.',1,15,3,1,1,'2026-04-02 00:36:20','2026-04-02 00:36:20',NULL),(4,1,4,'2026-03-25','2026-04-25','active','Kiểm soát đường huyết ổn định.',1,15,3,1,1,'2026-04-02 00:36:20','2026-04-02 00:36:20',NULL),(5,1,5,'2026-03-01','2026-06-01','active','Alzheimer giai đoạn nhẹ. Người thân cần giám sát.',1,30,3,1,1,'2026-04-02 00:36:20','2026-04-02 00:36:20',NULL),(6,2,6,'2026-03-18','2026-05-18','active','Viêm khớp dạng thấp. Xét nghiệm máu mỗi tháng.',1,15,3,1,1,'2026-04-02 00:36:20','2026-04-02 00:36:20',NULL),(7,1,1,'2026-04-09','2026-04-16','active','',1,15,3,1,1,'2026-04-02 01:38:19','2026-04-02 01:38:19',NULL),(8,1,7,'2026-04-15','2026-04-23','active','',1,15,3,1,1,'2026-04-02 01:38:40','2026-04-02 01:38:40',NULL);
/*!40000 ALTER TABLE `prescriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('doctor','patient') COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hospital` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `license_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'BS. Trần Minh Khoa','doctor@medconnect.vn','$2b$10$FPQKvscual4c10fQE7y1Oeaj4tOQsrRYUpqpMehOBrEOznXGJqlp.','0901234567','doctor','https://res.cloudinary.com/daytrfyrg/image/upload/v1775092565/medconnect/avatars/xli474qdh16uebdvgf5f.jpg','Nội tiết','Bệnh viện Đa khoa TP.HCM','BS-2024-001','2026-04-02 00:36:20','2026-04-02 01:16:05'),(2,'BS. Nguyễn Thị Mai','doctor2@medconnect.vn','$2b$10$FPQKvscual4c10fQE7y1Oeaj4tOQsrRYUpqpMehOBrEOznXGJqlp.','0907654321','doctor',NULL,'Tim mạch','Bệnh viện Chợ Rẫy','BS-2024-002','2026-04-02 00:36:20','2026-04-02 00:36:20'),(3,'Nguyễn Văn An','patient@medconnect.vn','$2b$10$FPQKvscual4c10fQE7y1Oeaj4tOQsrRYUpqpMehOBrEOznXGJqlp.','0912345678','patient',NULL,NULL,NULL,NULL,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(4,'Lê Thị Bích','patient2@medconnect.vn','$2b$10$FPQKvscual4c10fQE7y1Oeaj4tOQsrRYUpqpMehOBrEOznXGJqlp.','0923456789','patient',NULL,NULL,NULL,NULL,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(5,'Phạm Văn Cường','patient3@medconnect.vn','$2b$10$FPQKvscual4c10fQE7y1Oeaj4tOQsrRYUpqpMehOBrEOznXGJqlp.','0934567890','patient',NULL,NULL,NULL,NULL,'2026-04-02 00:36:20','2026-04-02 00:36:20'),(6,'hung','vovanhung77h12@gmail.com','$2b$10$wWqbOj5yXC5WZ0S/QOmTWO0IyAOODkokGU.tYGC3Hcm0lqHesLrym','0337163992','patient',NULL,NULL,NULL,NULL,'2026-04-02 01:19:18','2026-04-02 01:19:18');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-02  8:46:04
