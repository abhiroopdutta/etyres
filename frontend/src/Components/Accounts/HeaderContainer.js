import React, { useContext, useState, useEffect } from "react";
import styles from "./HeaderContainer.module.css";
import { message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Button from "../Button";
import { dayjsUTC } from "../dayjsUTCLocal";

function Cart() {

    return (
        <div className={styles["entities-container"]}>
            <header>
                <div className={styles["entities-header"]}>
                    <h5 className={styles["entities-title"]}>Headers</h5>
                    <Button
                        text="+"
                        className={styles["add-entity-btn"]}
                    />

                </div>
                <div className={styles["entities-search"]}>
                    <label htmlFor="search-box"></label>
                    <input id="search-box" type="text" placeholder="Find or search entities" />
                    <SearchOutlined />
                </div>
            </header>


            <section className={styles["entities-section-container"]}>
                <div className={styles["entities"]}>
                    {[1, 2, 3, 4].map((product) => (
                        <div>
                            <div className={styles["entity-name"]}>Cashbox </div>
                            <div className={styles["entity-name"]}>ICICI Bank </div>
                            <div className={styles["entity-name"]}>Maharashtra Bank </div>
                            <div className={styles["entity-name"]}>Rent </div>
                            <div className={styles["entity-name"]}>Salary </div>
                            <div className={styles["entity-name"]}>Electricity </div>
                            <div className={styles["entity-name"]}>Food </div>
                        </div>
                    ))}

                </div>
            </section>
        </div>

    );
}

export default Cart;
