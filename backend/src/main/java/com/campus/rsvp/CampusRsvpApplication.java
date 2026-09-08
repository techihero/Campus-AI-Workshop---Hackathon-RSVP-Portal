package com.campus.rsvp;

import com.campus.rsvp.model.CampusEvent;
import com.campus.rsvp.repository.CampusEventRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDateTime;
import java.util.Arrays;

@SpringBootApplication
public class CampusRsvpApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusRsvpApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedDatabase(CampusEventRepository eventRepository) {
        return args -> {
            if (eventRepository.count() == 0) {
                CampusEvent e1 = new CampusEvent(
                        null,
                        "Generative AI & Agentic Systems Bootcamp",
                        "Hands-on masterclass on building multi-agent architectures, reasoning loops, tool calling, and autonomous developer workflows.",
                        "Dr. Elena Rostova",
                        "Principal AI Researcher, DeepMind Alum",
                        "Computer Science & Eng",
                        "Turing Hall - Auditorium 101",
                        LocalDateTime.now().plusDays(7).withHour(9).withMinute(30),
                        100,
                        78
                );

                CampusEvent e2 = new CampusEvent(
                        null,
                        "Campus 36-Hour Autonomous Hackathon",
                        "Build and deploy end-to-end AI applications, robotics integrations, and edge vision models with compute clusters provided.",
                        "Marcus Thorne",
                        "Senior Director of Platform Engineering",
                        "Interdisciplinary AI Lab",
                        "Innovation Hub - Grand Atrium",
                        LocalDateTime.now().plusDays(10).withHour(18).withMinute(0),
                        150,
                        142
                );

                CampusEvent e3 = new CampusEvent(
                        null,
                        "LLM Fine-Tuning, LoRA & Quantization",
                        "Deep dive into parameter-efficient fine-tuning (PEFT), QLoRA, GGUF conversion, and running 70B models on commodity hardware.",
                        "Priya Sundaram",
                        "Staff ML Engineer & Open Source Core",
                        "Data Science & Analytics",
                        "Lovelace Lab 304",
                        LocalDateTime.now().plusDays(14).withHour(14).withMinute(0),
                        60,
                        58
                );

                CampusEvent e4 = new CampusEvent(
                        null,
                        "Computer Vision & Real-time Robotics",
                        "Deploying YOLOv10 and Spatial AI models on Jetson Orin Nano boards for autonomous obstacle avoidance.",
                        "Prof. David Kim",
                        "Chair of Robotics & Autonomous Systems",
                        "Robotics & Mechatronics",
                        "Robotics Bay West Wing",
                        LocalDateTime.now().plusDays(18).withHour(10).withMinute(0),
                        45,
                        45
                );

                eventRepository.saveAll(Arrays.asList(e1, e2, e3, e4));
                System.out.println(">> Campus AI RSVP Portal: Initial workshop catalog seeded successfully.");
            }
        };
    }
}
