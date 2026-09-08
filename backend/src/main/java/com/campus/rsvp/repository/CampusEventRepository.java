package com.campus.rsvp.repository;

import com.campus.rsvp.model.CampusEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampusEventRepository extends JpaRepository<CampusEvent, Integer> {
    List<CampusEvent> findAllByOrderByEventDateAsc();
    List<CampusEvent> findByDepartmentIgnoreCase(String department);
}
